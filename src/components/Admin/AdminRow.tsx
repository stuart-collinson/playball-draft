import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@pbd/components/ui/item"
import type { JSX, ReactNode } from "react"

type Props = {
  leading: ReactNode
  title: string
  meta: string
  detail: string
  actions: ReactNode
}

export const AdminRow = ({ leading, title, meta, detail, actions }: Props): JSX.Element => (
  <Item variant="outline" size="sm" className="rounded-xl bg-card px-3">
    <ItemMedia>{leading}</ItemMedia>
    <ItemContent className="min-w-0 gap-0.5">
      <ItemTitle className="block w-full truncate font-bold">{title}</ItemTitle>
      <ItemDescription className="line-clamp-1 text-xs">{meta}</ItemDescription>
      <ItemDescription className="line-clamp-1 text-xs">{detail}</ItemDescription>
    </ItemContent>
    <ItemActions className="gap-0.5">{actions}</ItemActions>
  </Item>
)
