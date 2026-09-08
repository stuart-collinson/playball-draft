import { LEAGUE_ABBREVIATIONS, LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { newspaperHeadlineFont } from "@pbd/lib/fonts"
import type { LeagueLedger } from "@pbd/lib/homeScreen"
import { leagueLedger } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

const UNNAMED = "TBC"

const INSIDE_PAGES = [
  { label: "Transfers & Trades", page: "p. 2" },
  { label: "Wheel of Misfortune", page: "p. 7" },
  { label: "Luck of the Week", page: "p. 9" },
]

const CELL_CLASSES = "flex min-w-0 flex-col gap-1 px-2.5 first:pl-0 last:pr-0"

const CELL_HEADING_CLASSES =
  "border-b border-newsprint-ink pb-0.5 text-[8px] font-bold uppercase tracking-[0.2em]"

const ledgerLine = ({ leader, margin }: LeagueLedger): string =>
  leader === null ? "Level on the season" : `${LEAGUE_LABELS[leader]} lead by ${fmtPts(margin)}`

export const NewspaperFooter = ({ snapshot }: Props): JSX.Element => {
  const ledger = leagueLedger(snapshot.premiership, snapshot.championship)

  return (
    <div className="grid shrink-0 grid-cols-[1.15fr_1fr_1fr] divide-x divide-newsprint-ink/40 border-t-4 border-double border-newsprint-ink pt-1.5">
      <section className={CELL_CLASSES}>
        <h3 className={CELL_HEADING_CLASSES}>The Victors</h3>
        {LEAGUE_SLUGS.map((slug) => (
          <p key={slug} className="flex items-baseline gap-1.5 text-[9px] leading-tight">
            <span className="w-9 shrink-0 text-[7.5px] uppercase tracking-[0.1em] text-newsprint-muted">
              {LEAGUE_ABBREVIATIONS[slug]}
            </span>
            <span className="min-w-0 max-w-max truncate font-bold">
              {snapshot[slug].winner?.name ?? UNNAMED}
            </span>
            <span
              aria-hidden
              className="min-w-1.5 flex-1 -translate-y-0.5 border-b border-dotted border-newsprint-muted"
            />
            <b className="shrink-0 tabular-nums">{fmtPts(snapshot[slug].winner?.points)}</b>
          </p>
        ))}
      </section>

      <section className={CELL_CLASSES}>
        <h3 className={CELL_HEADING_CLASSES}>On the Ledger</h3>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1 text-center">
          {LEAGUE_SLUGS.map((slug, index) => (
            <span key={slug} className={cn("flex min-w-0 flex-col", index === 1 && "col-start-3")}>
              <b
                className={cn(
                  newspaperHeadlineFont.className,
                  "text-[19px] font-bold leading-none tabular-nums",
                )}
              >
                {fmtPts(snapshot[slug].total)}
              </b>
              <span className="truncate text-[7px] uppercase tracking-[0.12em] text-newsprint-muted">
                {LEAGUE_ABBREVIATIONS[slug]}
              </span>
            </span>
          ))}
          <span className="col-start-2 row-start-1 pb-1.5 text-[9px] italic text-newsprint-muted">
            v
          </span>
        </div>
        <p className="text-center text-[8px] italic leading-snug text-newsprint-muted">
          {ledgerLine(ledger)}
        </p>
      </section>

      <section className={CELL_CLASSES}>
        <h3 className={CELL_HEADING_CLASSES}>Also Inside</h3>
        {INSIDE_PAGES.map(({ label, page }) => (
          <span key={label} className="flex items-baseline gap-1 text-[8px] leading-tight">
            <span className="truncate">{label}</span>
            <span
              aria-hidden
              className="min-w-1.5 flex-1 -translate-y-0.5 border-b border-dotted border-newsprint-muted"
            />
            <span className="shrink-0 text-newsprint-muted">{page}</span>
          </span>
        ))}
      </section>
    </div>
  )
}
