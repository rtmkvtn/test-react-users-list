import { useUsers } from '../hooks/useUsers'
import { UsersTable } from './UsersTable'

export function UsersPage() {
  const { data, loading, error, refetch } = useUsers({ limit: 10, skip: 0 })

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Users Catalog</h1>
      <UsersTable
        users={data?.users}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}
