// Seats of a parliament chamber on a semicircle, for the Federal Assembly figure (issue #3).
// Rows run from an inner to the outer radius; the row count is chosen so seats are about as far apart along
// a row as between rows, and each row gets seats in proportion to its length. Units: outer radius = 1.
const INNER = 0.42;

/** A seat: its angle, row and position on a semicircle of radius 1 around (0, 0), y pointing down. */
export interface Seat {
  a: number;
  row: number;
  x: number;
  y: number;
}

export function hemicycle(n: number) {
  let best: { radii: number[]; step: number; score: number } | undefined;
  for (let rows = 2; rows <= 14; rows++) {
    const radii = Array.from({ length: rows }, (_, i) => INNER + ((1 - INNER) * i) / (rows - 1));
    const step = radii.reduce((a, r) => a + Math.PI * r, 0) / n; // arc length per seat
    const score = Math.abs((1 - INNER) / (rows - 1) - step);
    if (!best || score < best.score) best = { radii, step, score };
  }
  const { radii, step } = best!;
  const counts = radii.map((r) => Math.floor((Math.PI * r) / step));
  // Seats left over go to the rows that lost the most by rounding down.
  const order = radii.map((r, i) => [(Math.PI * r) / step - counts[i], i]).sort((a, b) => b[0] - a[0]);
  for (let rest = n - counts.reduce((a, b) => a + b, 0), k = 0; rest > 0; rest--, k = (k + 1) % order.length) counts[order[k][1]]++;
  const seats: Seat[] = radii.flatMap((r, row) =>
    Array.from({ length: counts[row] }, (_, k) => {
      const a = Math.PI * (1 - (counts[row] === 1 ? 0.5 : k / (counts[row] - 1)));
      return { a, row, x: r * Math.cos(a), y: -r * Math.sin(a) };
    }),
  );
  // Left to right, as the seats would be counted.
  seats.sort((p, q) => q.a - p.a || p.row - q.row);
  return { seats, step, rows: radii.length };
}
