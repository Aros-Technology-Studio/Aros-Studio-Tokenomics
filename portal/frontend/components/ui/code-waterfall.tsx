/**
 * Renders the owner-provided reference artwork (public/effects/code-waterfall.png
 * — the original export's white background was stripped to real alpha at
 * processing time, with the white unmixed out of the line colors so there's
 * no halo) as a transparent overlay, plus two masked "flow" layers animated
 * as travelling light — one drifting down, one drifting up. Both flow layers
 * are clipped by the artwork's own alpha channel (mask-image), so the light
 * follows the actual drawn strands exactly — no procedural path guessing.
 *
 * Standalone on purpose: it fills whatever positioned ancestor wraps it (see
 * .code-waterfall in theme.css), so a page can drop it wherever it's wanted —
 * one section, a full background, later even inside GlobalBackground —
 * without this component knowing or caring which.
 */
export function CodeWaterfall() {
  return (
    <div className="code-waterfall" aria-hidden="true">
      <div className="code-waterfall__base" />
      <div className="code-waterfall__flow code-waterfall__flow--down" />
      <div className="code-waterfall__flow code-waterfall__flow--up" />
    </div>
  );
}
