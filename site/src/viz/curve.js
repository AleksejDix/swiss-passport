// Schematic forgetting curve for the method page (not measured data). Memory after the last repetition
// fades as exp(-t / stability); every spaced review brings it back and makes it fade more slowly.
// Both plans have six repetitions. "spaced" follows the app: learn on day 0, then reviews after
// 1, 3, 7, 14 and 30 days (days 1, 4, 11, 25, 55), each one just before recall drops to about 60 %.
export const DAYS = 60;

export const PLANS = {
  cram: { reviews: [0], stability: [3] },
  spaced: { reviews: [0, 1, 4, 11, 25, 55], stability: [2, 6, 14, 28, 60, 120] },
};

/** How much is still remembered on day t (0 to 1). */
export function recall(plan, t) {
  const { reviews, stability } = PLANS[plan];
  let i = 0;
  while (i + 1 < reviews.length && reviews[i + 1] <= t) i++;
  return Math.exp(-(t - reviews[i]) / stability[i]);
}

/** A word instead of a number, since the curve is a schema: 0 almost forgotten … 3 very good. */
export const level = (r) => (r >= 0.8 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0);

// Chart geometry (SVG user units).
export const W = 400;
export const H = 200;
export const PLOT = { left: 8, right: 392, top: 16, bottom: 188 };
export const x = (t) => PLOT.left + (t / DAYS) * (PLOT.right - PLOT.left);
export const y = (r) => PLOT.bottom - r * (PLOT.bottom - PLOT.top);

/** SVG path of a plan: smooth decay between repetitions, a vertical step up at each review. */
export function path(plan) {
  const { reviews } = PLANS[plan];
  const pts = [];
  for (let k = 0; k < reviews.length; k++) {
    const from = reviews[k];
    const to = k + 1 < reviews.length ? reviews[k + 1] : DAYS;
    for (let t = from; t < to; t += 0.25) pts.push([t, recall(plan, t)]);
    // Just before the next review: the lowest point, then the jump back to the top.
    pts.push([to, k + 1 < reviews.length ? Math.exp(-(to - from) / PLANS[plan].stability[k]) : recall(plan, to)]);
  }
  return pts.map(([t, r], i) => `${i ? "L" : "M"}${x(t).toFixed(1)} ${y(r).toFixed(1)}`).join(" ");
}
