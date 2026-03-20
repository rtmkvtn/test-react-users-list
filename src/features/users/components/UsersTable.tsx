import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { IUser } from '../types'

const SKELETON_ROW_COUNT = 10

interface UsersTableProps {
  users?: IUser[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function UsersTable({
  users = [],
  loading = false,
  error = null,
  onRetry,
}: UsersTableProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-destructive">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (!loading && users.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No users found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-15">Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="w-15">Age</TableHead>
          <TableHead>City</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
              <TableRow key={i} data-testid="skeleton-row">
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-30" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-45" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-30" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-7.5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-25" />
                </TableCell>
              </TableRow>
            ))
          : users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <img
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-8 w-8 rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell>{user.address.city}</TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
