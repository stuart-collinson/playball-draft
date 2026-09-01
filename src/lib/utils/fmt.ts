export const fmtPts = (n: number | null | undefined): string => (n ?? 0).toLocaleString("en-GB")

export const round1 = (n: number): number => Math.round(n * 10) / 10

export const fmtSigned = (n: number): string => (n > 0 ? `+${n}` : String(n))

const UK_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/London",
})

export const fmtDate = (iso: string): string => UK_DATE_FORMATTER.format(new Date(iso))
