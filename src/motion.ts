/** True when the reader asked their device for less motion: nothing here moves by itself, and a move ends at once. */
export function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
