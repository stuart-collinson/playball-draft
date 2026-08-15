const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60 * MS_PER_SECOND
const MS_PER_HOUR = 60 * MS_PER_MINUTE

export const seconds = (count: number): number => count * MS_PER_SECOND
export const minutes = (count: number): number => count * MS_PER_MINUTE
export const hours = (count: number): number => count * MS_PER_HOUR
