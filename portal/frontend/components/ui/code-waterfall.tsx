/**
 * Renders the owner-provided reference artwork (public/effects/code-waterfall.png,
 * a transparent-background export — see the file for exact processing) as a
 * static image. No animation, no masked flow layers: owner call.
 *
 * Standalone on purpose: it fills whatever positioned ancestor wraps it (see
 * .code-waterfall in theme.css), so a page can drop it wherever it's wanted.
 */
export function CodeWaterfall() {
  return (
    <div className="code-waterfall" aria-hidden="true">
      <div className="code-waterfall__base" />
    </div>
  );
}
