const X0 = 170, Y0 = 64, S = 50, R = 10, CORNER = 8;

const PATHS = [
 'M 178 64H 220V 79A 10 10 0 0 0 220 99V 114H 205A 10 10 0 0 1 185 114H 170V 72A 8 8 0 0 1 178 64Z',
 'M 220 64H 262A 8 8 0 0 1 270 72V 114H 255A 10 10 0 0 1 235 114H 220V 99A 10 10 0 0 0 220 79V 64Z',
 'M 170 114H 185A 10 10 0 0 0 205 114H 220V 129A 10 10 0 0 0 220 149V 164H 178A 8 8 0 0 1 170 156V 114Z',
 'M 220 114H 235A 10 10 0 0 0 255 114H 270V 156A 8 8 0 0 1 262 164H 220V 149A 10 10 0 0 0 220 129V 114Z',
];

function body(id: number) {
 const col = id % 2, row = id >> 1;
 const x0 = X0 + col * S, y0 = Y0 + row * S;
 return {x0, y0, x1: x0 + S, y1: y0 + S};
}

function inSemi(x: number, y: number, cx: number, cy: number, dir: 'e' | 's') {
 const dx = x - cx, dy = y - cy;
 if (dx * dx + dy * dy > R * R) return false;
 return dir === 'e' ? dx >= 0 : dy >= 0;
}

function inBody(id: number, x: number, y: number) {
 const b = body(id);
 if (x < b.x0 || x > b.x1 || y < b.y0 || y > b.y1) return false;
 if (id === 0 && x < b.x0 + CORNER && y < b.y0 + CORNER) return (x - b.x0 - CORNER) ** 2 + (y - b.y0 - CORNER) ** 2 <= CORNER * CORNER;
 if (id === 1 && x > b.x1 - CORNER && y < b.y0 + CORNER) return (x - b.x1 + CORNER) ** 2 + (y - b.y0 - CORNER) ** 2 <= CORNER * CORNER;
 if (id === 2 && x < b.x0 + CORNER && y > b.y1 - CORNER) return (x - b.x0 - CORNER) ** 2 + (y - b.y1 + CORNER) ** 2 <= CORNER * CORNER;
 if (id === 3 && x > b.x1 - CORNER && y > b.y1 - CORNER) return (x - b.x1 + CORNER) ** 2 + (y - b.y1 + CORNER) ** 2 <= CORNER * CORNER;
 return true;
}

/** 0 concepts, 1 rules, 2 entities, 3 relationships. Tabs and sockets are exact semicircles. */
export function puzzleContains(id: number, x: number, y: number) {
 const b = body(id);
 let hit = inBody(id, x, y);
 if (id === 0) {
  if (inSemi(x, y, b.x1, b.y0 + S / 2, 'e')) hit = true;
  if (inSemi(x, y, b.x0 + S / 2, b.y1, 's')) hit = true;
 } else if (id === 1) {
  if (inSemi(x, y, b.x0, b.y0 + S / 2, 'e')) hit = false;
  if (inSemi(x, y, b.x0 + S / 2, b.y1, 's')) hit = true;
 } else if (id === 2) {
  if (inSemi(x, y, b.x0 + S / 2, b.y0, 's')) hit = false;
  if (inSemi(x, y, b.x1, b.y0 + S / 2, 'e')) hit = true;
 } else {
  if (inSemi(x, y, b.x0 + S / 2, b.y0, 's')) hit = false;
  if (inSemi(x, y, b.x0, b.y0 + S / 2, 'e')) hit = false;
 }
 return hit;
}

export function puzzlePiecePath(id: number) {
 return PATHS[id];
}

export function puzzleRest(id: number) {
 return {x: id % 2 === 0 ? -34 : 34, y: id < 2 ? -22 : 22};
}

export const puzzleLabels = ['Concepts', 'Rules', 'Entities', 'Relationships'] as const;
