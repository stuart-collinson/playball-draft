import type { JSX } from "react"
import { Skeleton } from "@pbd/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pbd/components/ui/table"

const SKELETON_ROW_COUNT = 10

export const TableSkeleton = (): JSX.Element => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-16">Rank</TableHead>
        <TableHead>Player</TableHead>
        <TableHead>Team</TableHead>
        <TableHead className="text-right">Score</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-10" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
