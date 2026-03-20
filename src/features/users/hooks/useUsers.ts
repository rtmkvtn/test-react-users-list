import { useCallback, useEffect, useReducer, useRef } from 'react'

import type { IUsersResponse } from '../types'

const API_BASE = 'https://dummyjson.com'

interface UseUsersParams {
  limit?: number
  skip?: number
  query?: string
}

interface UseUsersResult {
  data: IUsersResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

type State =
  | { status: 'idle' }
  | { status: 'loading'; data: IUsersResponse | null }
  | { status: 'success'; data: IUsersResponse }
  | { status: 'error'; error: string; data: IUsersResponse | null }

type Action =
  | { type: 'FETCH'; data: IUsersResponse | null }
  | { type: 'SUCCESS'; data: IUsersResponse }
  | { type: 'ERROR'; error: string; data: IUsersResponse | null }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH':
      return { status: 'loading', data: action.data }
    case 'SUCCESS':
      return { status: 'success', data: action.data }
    case 'ERROR':
      return { status: 'error', error: action.error, data: action.data }
  }
}

export function useUsers({
  limit = 10,
  skip = 0,
  query = '',
}: UseUsersParams = {}): UseUsersResult {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' })
  const paramsRef = useRef({ limit, skip, query })
  paramsRef.current = { limit, skip, query }

  const previousDataRef = useRef<IUsersResponse | null>(null)
  if (state.status === 'success') {
    previousDataRef.current = state.data
  }

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    const { limit: l, skip: s, query: q } = paramsRef.current
    dispatch({ type: 'FETCH', data: previousDataRef.current })

    try {
      const url = q
        ? `${API_BASE}/users/search?q=${encodeURIComponent(q)}&limit=${l}&skip=${s}`
        : `${API_BASE}/users?limit=${l}&skip=${s}`
      const response = await fetch(url, { signal })

      if (!response.ok) {
        dispatch({
          type: 'ERROR',
          error: `Failed to fetch users: ${response.statusText}`,
          data: previousDataRef.current,
        })
        return
      }

      const json: IUsersResponse = await response.json()
      dispatch({ type: 'SUCCESS', data: json })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      dispatch({
        type: 'ERROR',
        error: err instanceof Error ? err.message : 'An error occurred',
        data: previousDataRef.current,
      })
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchUsers(controller.signal)
    return () => controller.abort()
  }, [limit, skip, query, fetchUsers])

  const data = state.status === 'success'
    ? state.data
    : state.status === 'error' || state.status === 'loading'
      ? state.data
      : null

  const loading = state.status === 'idle' || state.status === 'loading'
  const error = state.status === 'error' ? state.error : null

  const refetch = useCallback(() => {
    void fetchUsers()
  }, [fetchUsers])

  return { data, loading, error, refetch }
}
