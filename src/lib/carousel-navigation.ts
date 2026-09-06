/** Horizontal tab navigation; unrelated keys retain their native behavior. */
export function carouselTabIndex(
  current: number,
  key: string,
  count: number,
): number | null {
  if (count < 1) return null;
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
