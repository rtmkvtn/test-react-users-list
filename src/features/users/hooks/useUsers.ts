import { useCallback, useEffect, useState } from 'react'

import type { IUsersResponse } from '../types'

const API_BASE = 'https://dummyjson.com'

interface UseUsersParams {
  limit?: number
  skip?: number
}

interface UseUsersResult {
  data: IUsersResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useUsers({
  limit = 10,
  skip = 0,
}: UseUsersParams = {}): UseUsersResult {
  const [data, setData] = useState<IUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const url = `${API_BASE}/users?limit=${limit}&skip=${skip}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const json: IUsersResponse = await response.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [limit, skip])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { data, loading, error, refetch: fetchUsers }
}
