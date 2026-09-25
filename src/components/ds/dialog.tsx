"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Modal dialog on Base UI: focus trap, scroll lock, Escape, outside click and
 * focus return are handled by the primitive.
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
 * so focus can return to the trigger.
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

/** Base UI Dialog root that also makes the page behind it inert while open. */
export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: BaseDialog.Root.Props) {
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

export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

const sizes = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const;

export function DialogContent({
  children,
  size = "lg",
  showClose = true,
  className,
  ...props
}: Omit<BaseDialog.Popup.Props, "className"> & {
  children: ReactNode;
  size?: keyof typeof sizes;
  showClose?: boolean;
  className?: string;
}) {
  return (
    <BaseDialog.Portal>
      {/*
       * The backdrop spans the large viewport (h-lvh) so it also dims the areas
       * behind Safari's status bar and toolbar, which Safari tints from it. The
       * viewport uses the dynamic height (h-dvh) so the dialog itself always
       * sits in the visible area, never under the toolbar.
       */}
      <BaseDialog.Backdrop className="fixed inset-x-0 top-0 z-50 h-lvh bg-ink-950/65 backdrop-blur-[6px] transition-opacity duration-500 ease-brand data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Viewport className="fixed inset-x-0 top-0 z-50 flex h-dvh [align-items:safe_end] justify-center overflow-y-auto overscroll-contain p-3 sm:[align-items:safe_center] sm:p-6">
        <BaseDialog.Popup
          data-tone="paper"
          className={cn(
            "relative w-full overflow-clip rounded-4xl bg-canvas text-fg shadow-lift outline-none",
            "transition-[opacity,translate,scale] duration-500 ease-brand",
            "data-[starting-style]:translate-y-8 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
            "data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[ending-style]:duration-300",
            "motion-reduce:transition-none",
            sizes[size],
            className,
          )}
          {...props}
        >
          {showClose ? (
            // A zero-height sticky rail keeps the close button in reach while
            // a dialog taller than the screen scrolls in the viewport. The
            // popup clips (overflow-clip) rather than hides, because a hidden
            // overflow would make the popup the sticky scroller. The rail sits
            // in flow, so padding on the popup (className) offsets it; put
            // padding on an inner wrapper instead.
            <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
              <BaseDialog.Close
                aria-label="Close"
                className="pointer-events-auto mt-3 mr-3 grid size-10 shrink-0 place-items-center rounded-full bg-white/85 text-violet-950 shadow-soft backdrop-blur transition-[background-color,rotate] duration-300 ease-brand hover:rotate-90 hover:bg-white"
              >
                <X aria-hidden className="size-4" />
              </BaseDialog.Close>
            </div>
          ) : null}
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: BaseDialog.Title.Props & { className?: string }) {
  return (
    <BaseDialog.Title
      className={cn("text-heading-lg text-fg", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: BaseDialog.Description.Props & { className?: string }) {
  return (
    <BaseDialog.Description
      className={cn("text-body text-fg-muted", className)}
      {...props}
    />
  );
}
