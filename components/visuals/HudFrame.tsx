export function HudFrame() {
  return (
    <div className="hud-frame" aria-hidden="true">
      <span className="hud-frame-edge hud-frame-top" />
      <span className="hud-frame-edge hud-frame-right" />
      <span className="hud-frame-edge hud-frame-bottom" />
      <span className="hud-frame-edge hud-frame-left" />

      <svg className="hud-frame-corner hud-frame-tl" viewBox="0 0 88 88">
        <path d="M18 6h28M6 18v28M6 6h16v16H6z" />
        <path d="M38 6h12M6 38v12" />
      </svg>
      <svg className="hud-frame-corner hud-frame-tr" viewBox="0 0 88 88">
        <path d="M70 6H42M82 18v28M82 6H66v16h16z" />
        <path d="M50 6H38M82 38v12" />
      </svg>
      <svg className="hud-frame-corner hud-frame-bl" viewBox="0 0 88 88">
        <path d="M18 82h28M6 70V42M6 82h16V66H6z" />
        <path d="M38 82h12M6 50V38" />
      </svg>
      <svg className="hud-frame-corner hud-frame-br" viewBox="0 0 88 88">
        <path d="M70 82H42M82 70V42M82 82H66V66h16z" />
        <path d="M50 82H38M82 50V38" />
      </svg>

      <span className="hud-frame-notch hud-frame-notch-top" />
      <span className="hud-frame-notch hud-frame-notch-bottom" />
      <span className="hud-frame-tick hud-frame-tick-l" />
      <span className="hud-frame-tick hud-frame-tick-r" />
    </div>
  );
}
