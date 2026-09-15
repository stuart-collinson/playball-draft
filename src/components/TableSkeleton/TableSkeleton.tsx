import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { Skeleton } from "@pbd/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pbd/components/ui/table"
import { cn } from "@pbd/lib/className"
import {
  TABLE_CELL_CLASSES,
  TABLE_HEAD_CLASSES,
  TABLE_SHELL_CLASSES,
} from "@pbd/lib/constants/Tables"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const DEFAULT_ROW_COUNT = 8

const VALUE_COLUMNS = skeletonKeys("value", 2)

type TableSkeletonProps = {
  rowCount?: number
}

export const TableSkeleton = ({
  rowCount = DEFAULT_ROW_COUNT,
}: TableSkeletonProps): JSX.Element => (
  <div className={TABLE_SHELL_CLASSES}>
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(TABLE_HEAD_CLASSES, "w-14 pr-1 text-center")}>#</TableHead>
          <TableHead className={TABLE_HEAD_CLASSES}>
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-8 shrink-0" />
              Manager
            </span>
          </TableHead>
          {VALUE_COLUMNS.map((key) => (
            <TableHead key={key} className={cn(TABLE_HEAD_CLASSES, "w-14 text-right")}>
              <SkeletonText className="w-6" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {skeletonKeys("row", rowCount).map((key) => (
          <TableRow key={key} className="hover:bg-transparent">
            <TableCell className={cn(TABLE_CELL_CLASSES, "pr-1")}>
              <div className="flex h-8 w-10 items-center justify-center">
                <Skeleton className="h-4 w-5" />
              </div>
            </TableCell>

            <TableCell className={cn(TABLE_CELL_CLASSES, "w-full max-w-0")}>
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-semibold">
                    <SkeletonText className="w-28" />
                  </p>
                  <p className="truncate text-xs">
                    <SkeletonText className="w-20" />
                  </p>
                </div>
              </div>
            </TableCell>

            {VALUE_COLUMNS.map((column) => (
              <TableCell key={column} className={cn(TABLE_CELL_CLASSES, "w-14 text-right")}>
                <p className="text-base font-black">
                  <SkeletonText className="w-8" />
                </p>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)
