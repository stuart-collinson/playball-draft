import { cn } from "@pbd/lib/className"
import type { ForfeitStatus } from "@pbd/lib/home/homeScreen"
import { forfeitStatusCopy } from "@pbd/lib/home/homeScreen"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  status: ForfeitStatus
  headlineClassName: string
  detailClassName: string
}

const HEADLINE_CLASSES =
  "line-clamp-2 text-[10px] font-black uppercase leading-tight tracking-wider"

export const HomeForfeitStatus = ({
  status,
  headlineClassName,
  detailClassName,
}: Props): JSX.Element => {
  const copy = forfeitStatusCopy(status)
  const headline = <>&#10022; {copy.headline}</>
  const headlineClasses = cn(HEADLINE_CLASSES, headlineClassName)

  return (
    <div className="w-full shrink-0">
      {copy.href ? (
        <Link href={copy.href} className={cn(headlineClasses, "underline")}>
          {headline}
        </Link>
      ) : (
        <p className={headlineClasses}>{headline}</p>
      )}
      <p className={cn("text-[8px] italic", detailClassName)}>{copy.detail}</p>
    </div>
  )
}
