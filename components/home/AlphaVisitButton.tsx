"use client";

export function AlphaVisitButton() {
  function visitVoltronAlpha() {
    window.dispatchEvent(new CustomEvent("voltron:visit-alpha"));
    document.getElementById("partner")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button type="button" className="btn-alpha-visit" onClick={visitVoltronAlpha}>
      Visit Voltron Alpha
    </button>
  );
}
