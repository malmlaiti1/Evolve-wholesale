/** "$612" or "$11.50" — whole dollars show no decimals, cents show two. */
export function money(n: number): string {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: n % 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/** Always whole dollars, e.g. "$3,184". */
export function money0(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}
