/** Visual groupings only; numbered station functions await the confirmed plant route. */
export function alphaBathTone(id: string) {
  const number = Number(id.slice(1));
  return number === 7 ? "graphite" : number >= 6 && number <= 8 ? "steel" : number >= 9 ? "ice" : "cyan";
}
export function alphaBathColor(id: string, dark: boolean) {
  const colors = dark
    ? { cyan: 0x207da6, steel: 0x315b82, graphite: 0x233f50, ice: 0x438ba9 }
    : { cyan: 0x128bbd, steel: 0x326b97, graphite: 0x244654, ice: 0x64b3d0 };
  return colors[alphaBathTone(id)];
}
