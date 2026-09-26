/**
 * First focusable element on every page: jumps keyboard users past the
 * header to `#main-content`, which the site layout renders around each page.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute top-3 left-3 z-[100] -translate-y-[200%] rounded-full bg-white px-5 py-3 font-semibold text-small text-violet-950 shadow-lift transition-transform focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
