export const fmtPts = (n: number | null | undefined): string => (n ?? 0).toLocaleString("en-GB")

export const round1 = (n: number): number => Math.round(n * 10) / 10

export const fmtSigned = (n: number): string => (n > 0 ? `+${n}` : String(n))
