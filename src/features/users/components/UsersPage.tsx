import { useSearchParams } from 'react-router-dom'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useUsers } from '../hooks/useUsers'
import { UsersTable } from './UsersTable'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  pages.push(1)

  let start = Math.max(2, currentPage - 1)
  let end = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 3) {
    end = Math.min(4, totalPages - 1)
  }
  if (currentPage >= totalPages - 2) {
    start = Math.max(totalPages - 3, 2)
  }

  if (start > 2) pages.push(-1) // ellipsis
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (end < totalPages - 1) pages.push(-2) // ellipsis

  pages.push(totalPages)

  return pages
}

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || '1')
  const limit = Number(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const { data, loading, error, refetch } = useUsers({ limit, skip })
  const totalPages = data ? Math.ceil(data.total / limit) : 0

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  const setLimit = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('limit', String(newLimit))
      next.set('page', '1')
      return next
    })
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Users Catalog</h1>
      <UsersTable
        users={data?.users}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
      {!loading && !error && data && data.users.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={limit}
              onValueChange={(val) => setLimit(val as number)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {pageNumbers.map((p) =>
                p < 0 ? (
                  <PaginationItem key={p}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
