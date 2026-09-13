export const mergeEntryRecords = <T>(records: Record<number, T>[]): Record<number, T> => {
  const merged: Record<number, T> = {}
  for (const record of records) Object.assign(merged, record)
  return merged
}
