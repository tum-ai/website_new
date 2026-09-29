import {
  defineField,
  type ImageValue,
  type SlugValidationContext,
  type ValidationContext,
} from "sanity";
import { sanityApiVersion } from "../../../lib/sanity-config";

/**
 * Field builders for the logo and people types (organization, person,
 * caseStudy, partnersCopy): images with alt text and size checks, and keys
 * that must be unique. Help text is written for editors.
 */

/** Width and height from an asset id (`image-<hash>-<w>x<h>-<ext>`). */
function assetDimensions(
  ref: string | undefined,
): { width: number; height: number; extension: string } | null {
  const match = /^image-[a-f0-9]+-(\d+)x(\d+)-(\w+)$/.exec(ref ?? "");
  if (!match) return null;
  return {
    width: Number(match[1]),
    height: Number(match[2]),
    extension: match[3],
  };
}

/**
 * A warning (never a publishing blocker) when an uploaded raster image is
 * smaller than the page needs. Vector files (SVG) pass at any size.
 */
function minimumSize(minWidth: number, minHeight: number, advice: string) {
  return (value: ImageValue | undefined) => {
    const size = assetDimensions(value?.asset?._ref);
    if (!size || size.extension === "svg") return true;
    return size.width >= minWidth && size.height >= minHeight
      ? true
      : `This file is ${size.width} × ${size.height} px. ${advice}`;
  };
}

const altField = (description: string, required: boolean) =>
  defineField({
    name: "alt",
    title: "Alternative text",
    type: "string",
    description,
    validation: required
      ? (Rule) =>
          Rule.required().error(
            "Describe the image for screen readers, for example “Accel logo”.",
          )
      : undefined,
  });

/**
 * Logo artwork: alt text (required), the symbol-only flag and an optional
 * aspect ratio for artwork whose file bounds differ from the drawing.
 */
export function logoArtworkField(options: {
  name: string;
  title: string;
  description: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "image",
    options: { accept: "image/svg+xml,image/png,image/webp,image/jpeg" },
    fields: [
      altField("Usually the name and “logo”: “Accel logo”.", true),
      defineField({
        name: "symbolOnly",
        title: "Symbol only",
        type: "boolean",
        description:
          "Tick when the artwork is a symbol without the name (an app icon, a monogram). Pages then set the name beside it.",
        initialValue: false,
      }),
      defineField({
        name: "aspectRatio",
        title: "Aspect ratio of the drawing",
        type: "number",
        description:
          "Width ÷ height of the drawn artwork, only when it differs from the file (an SVG whose viewBox has padding or fractions). The events hero and the REX logos use it to give every logo the same visual weight. Leave empty to use the file's size.",
        validation: (Rule) => Rule.positive().max(300),
      }),
    ],
    validation: (Rule) =>
      Rule.custom(
        minimumSize(
          120,
          24,
          "Upload an SVG, or a PNG or WebP at least 240 px wide, so the logo stays sharp.",
        ),
      ).warning(),
  });
}

/**
 * A portrait: cropped to a circle or card around the hotspot, so the hotspot
 * goes on the face. Decorative (it always sits beside the name), so alt
 * text is optional.
 */
export function portraitField(options: { description?: string } = {}) {
  return defineField({
    name: "portrait",
    title: "Portrait",
    description: [
      "A photo of the person. Set the hotspot on the face: pages crop around it.",
      options.description,
    ]
      .filter(Boolean)
      .join(" "),
    type: "image",
    options: { hotspot: true },
    fields: [
      altField(
        "Leave empty: the portrait sits beside the person's name, so screen readers skip it.",
        false,
      ),
    ],
    validation: (Rule) => [
      Rule.required(),
      Rule.custom(
        minimumSize(
          240,
          240,
          "Upload at least 480 × 480 px so the portrait stays sharp.",
        ),
      ).warning(),
    ],
  });
}

/** A photo with required alt text, cropped around its hotspot. */
export function photoField(options: {
  name: string;
  title: string;
  description?: string;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: [
      options.description,
      "Set the hotspot on the subject: the card crops around it.",
    ]
      .filter(Boolean)
      .join(" "),
    type: "image",
    options: { hotspot: true },
    fields: [altField("What the photo shows, for screen readers.", true)],
    validation: (Rule) => [
      Rule.required(),
      Rule.custom(
        minimumSize(
          800,
          500,
          "Upload at least 1600 px wide so the photo stays sharp on large screens.",
        ),
      ).warning(),
    ],
  });
}

/** Lowercase letters, digits and single hyphens: `hudson-river-trading`. */
export const kebabKey = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validation that no other published or draft document of `type` (and, if
 * given, with the same value in `scopeField`) uses this key.
 */
export function uniqueKey(type: string, scopeField?: string) {
  return async (
    value: unknown,
    context: ValidationContext | SlugValidationContext,
  ) => {
    if (typeof value !== "string" || !value) return true;
    const id = context.document?._id?.replace(/^drafts\./, "");
    if (!id) return true;
    const scope = scopeField
      ? (context.document?.[scopeField] as string | undefined)
      : undefined;
    const client = context.getClient({ apiVersion: sanityApiVersion });
    const clash = await client.fetch<number>(
      `count(*[_type == $type && key == $key && !(_id in [$id, $draft])${scopeField ? ` && ${scopeField} == $scope` : ""}])`,
      { type, key: value, id, draft: `drafts.${id}`, scope: scope ?? null },
    );
    return clash === 0
      ? true
      : "Another document already uses this key. Keys must be unique.";
  };
}
