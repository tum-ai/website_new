"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
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
export const Dialog = BaseDialog.Root;
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
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink-950/65 backdrop-blur-[6px] transition-opacity duration-500 ease-brand data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
      <BaseDialog.Viewport className="fixed inset-0 z-50 flex [align-items:safe_end] justify-center overflow-y-auto overscroll-contain p-3 sm:[align-items:safe_center] sm:p-6">
        <BaseDialog.Popup
          data-tone="paper"
          className={cn(
            "relative w-full overflow-hidden rounded-4xl bg-canvas text-fg shadow-lift outline-none",
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
            <BaseDialog.Close
              aria-label="Close"
              className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-white/85 text-violet-950 shadow-soft backdrop-blur transition-[background-color,rotate] duration-300 ease-brand hover:rotate-90 hover:bg-white"
            >
              <X aria-hidden className="size-4" />
            </BaseDialog.Close>
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
