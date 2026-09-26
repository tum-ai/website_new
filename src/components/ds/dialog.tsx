"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./section";

/*
 * Modal dialog on Base UI: focus trap, scroll lock, Escape, outside click and
 * focus return are handled by the primitive; <Dialog> adds an inert page.
 *
 *   <Dialog>
 *     <DialogTrigger render={<Button variant="outline" />}>Details</DialogTrigger>
 *     <DialogContent>
 *       <DialogTitle>…</DialogTitle>
 *       <DialogDescription>…</DialogDescription>
 *     </DialogContent>
 *   </Dialog>
 */

/** Open modals holding the page inert (supports nested dialogs). */
let inertHolders = 0;

/**
 * Makes the page behind an open modal inert: nothing there can be focused,
 * tapped or scrolled into view. Base UI's focus guards alone leak in Safari,
 * whose Tab key skips links by default, so focus (and the scroll position)
 * escaped to the page behind. The page root is `#app-root` (layout.tsx);
 * portals render outside it. Released as soon as the modal starts closing,
 * so focus can return to the trigger. <Dialog> calls it for you; use it
 * directly only around a raw Base UI dialog.
 */
export function useInertBackground(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById("app-root");
    if (!root) return;
    inertHolders += 1;
    root.inert = true;
    return () => {
      inertHolders = Math.max(0, inertHolders - 1);
      if (inertHolders === 0) root.inert = false;
    };
  }, [open]);
}

/** Props for {@link Dialog}: Base UI's root props. */
export type DialogProps = BaseDialog.Root.Props;

/** Base UI Dialog root that also makes the page behind it inert while open. */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  useInertBackground(open ?? uncontrolledOpen);
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next, details) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next, details);
      }}
      {...props}
    />
  );
}

/** Opens the dialog. Use `render` to make it a <Button>. */
export const DialogTrigger = BaseDialog.Trigger;

/** Closes the dialog. Use `render` to make it a <Button>. */
export const DialogClose = BaseDialog.Close;

const popupStyles = cva(
  [
    "relative w-full bg-canvas text-fg outline-none",
    "transition-[opacity,translate,scale] duration-500 ease-brand motion-reduce:transition-none",
  ],
  {
    variants: {
      /**
       * `modal`: a rounded card centered on phones' bottom edge and in the
       * middle on larger screens. `fullscreen`: a full-height sheet that
       * slides in from the right and covers the screen on phones (the
       * header menu); cap its width with `className` (e.g. `max-w-md`).
       */
      variant: {
        modal: [
          "overflow-clip rounded-4xl shadow-lift",
          "data-[starting-style]:translate-y-8 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
          "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[ending-style]:duration-300",
        ],
        fullscreen: [
          "fixed top-0 right-0 isolate z-50 h-lvh overflow-y-auto overscroll-contain ease-snappy",
          "data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        ],
      },
      /** Maximum width of the `modal` variant. */
      size: {
        md: "",
        lg: "",
        xl: "",
      },
    },
    compoundVariants: [
      { variant: "modal", size: "md", className: "max-w-lg" },
      { variant: "modal", size: "lg", className: "max-w-3xl" },
      { variant: "modal", size: "xl", className: "max-w-5xl" },
    ],
    defaultVariants: { variant: "modal", size: "lg" },
  },
);

/** Props for {@link DialogContent}. */
export type DialogContentProps = Omit<
  BaseDialog.Popup.Props,
  "className" | "children"
> &
  VariantProps<typeof popupStyles> & {
    /** The dialog's content; include a <DialogTitle>. */
    children: ReactNode;
    /**
     * Show the round close button in the top-right corner. Default true for
     * `modal`, false for `fullscreen` (which usually has its own header row).
     */
    showClose?: boolean;
    /** Accessible name of the close button. Default "Close". */
    closeLabel?: string;
    /** Band tone of the dialog surface. Default `paper`. */
    tone?: Tone;
    /** Classes merged over the popup. */
    className?: string;
  };

function CloseButton({ label }: { label: string }) {
  return (
    <BaseDialog.Close
      aria-label={label}
      className="pointer-events-auto mt-3 mr-3 grid size-10 shrink-0 place-items-center rounded-full bg-white/85 text-violet-950 shadow-soft backdrop-blur transition-[background-color,rotate] duration-300 ease-brand hover:bg-white motion-safe:hover:rotate-90"
    >
      <X aria-hidden="true" className="size-4" />
    </BaseDialog.Close>
  );
}

/**
 * The dialog surface, portalled with its backdrop. The backdrop spans the
 * large viewport (h-lvh) so it also dims the areas behind Safari's status
 * bar and toolbar, which Safari tints from it.
 */
export function DialogContent({
  children,
  variant = "modal",
  size,
  showClose,
  closeLabel = "Close",
  tone = "paper",
  className,
  ...props
}: DialogContentProps) {
  const withClose = showClose ?? variant === "modal";
  const popup = (
    <BaseDialog.Popup
      data-tone={tone}
      className={cn(popupStyles({ variant, size }), className)}
      {...props}
    >
      {withClose ? (
        // A zero-height sticky rail keeps the close button in reach while
        // a dialog taller than the screen scrolls. The popup clips
        // (overflow-clip) rather than hides, because a hidden overflow would
        // make the popup the sticky scroller. The rail sits in flow, so put
        // padding on an inner wrapper, not on the popup.
        <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
          <CloseButton label={closeLabel} />
        </div>
      ) : null}
      {children}
    </BaseDialog.Popup>
  );

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-x-0 top-0 z-50 h-lvh bg-ink-950/65 backdrop-blur-[6px] transition-opacity duration-500 ease-brand data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
      {variant === "fullscreen" ? (
        popup
      ) : (
        // The viewport uses the dynamic height (h-dvh) so the dialog always
        // sits in the visible area, never under Safari's toolbar.
        <BaseDialog.Viewport className="fixed inset-x-0 top-0 z-50 flex h-dvh justify-center overflow-y-auto overscroll-contain p-3 [align-items:safe_end] sm:p-6 sm:[align-items:safe_center]">
          {popup}
        </BaseDialog.Viewport>
      )}
    </BaseDialog.Portal>
  );
}

/** Props for {@link DialogTitle}: Base UI's title props. */
export type DialogTitleProps = Omit<BaseDialog.Title.Props, "className"> & {
  /** Classes merged over the heading. */
  className?: string;
};

/** The dialog's name (an `h2`), announced when it opens. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      className={cn("text-fg text-heading-lg", className)}
      {...props}
    />
  );
}

/** Props for {@link DialogDescription}: Base UI's description props. */
export type DialogDescriptionProps = Omit<
  BaseDialog.Description.Props,
  "className"
> & {
  /** Classes merged over the paragraph. */
  className?: string;
};

/** A sentence that describes the dialog, announced after its title. */
export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      className={cn("text-body text-fg-muted", className)}
      {...props}
    />
  );
}
