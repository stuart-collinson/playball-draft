export const countGameweeksPlayed = (
  currentEvent: number | null,
  startEvent: number,
): number => {
  if (currentEvent === null) return 0
  return Math.max(currentEvent - startEvent + 1, 0)
}
