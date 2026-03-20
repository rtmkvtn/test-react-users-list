import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUsers } from './useUsers'

describe('useUsers', () => {
  it('fetches users from the API', async () => {
    const { result } = renderHook(() => useUsers({ limit: 5, skip: 0 }))

    expect(result.current.loading).toBe(true)

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 5000 }
    )

    expect(result.current.error).toBeNull()
    expect(result.current.data).not.toBeNull()
    expect(result.current.data!.users).toHaveLength(5)
    expect(result.current.data!.total).toBeGreaterThan(0)

    const user = result.current.data!.users[0]
    expect(user).toHaveProperty('firstName')
    expect(user).toHaveProperty('lastName')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('phone')
    expect(user).toHaveProperty('age')
    expect(user).toHaveProperty('image')
    expect(user).toHaveProperty('address')
  })
})

describe('useUsers abort behavior', () => {
  const mockUsers = {
    users: [
      {
        id: 1,
        firstName: 'A',
        lastName: 'B',
        email: '',
        phone: '',
        age: 1,
        image: '',
        address: { city: '' },
      },
    ],
    total: 1,
    skip: 0,
    limit: 10,
  }

  const mockUsersPage2 = {
    users: [
      {
        id: 2,
        firstName: 'C',
        lastName: 'D',
        email: '',
        phone: '',
        age: 2,
        image: '',
        address: { city: '' },
      },
    ],
    total: 2,
    skip: 10,
    limit: 10,
  }

  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('aborts the previous request when params change', async () => {
    let resolveFirst: (v: Response) => void
    let resolveSecond: (v: Response) => void

    fetchSpy
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          })
      )

    const { result, rerender } = renderHook(
      ({ skip }) => useUsers({ limit: 10, skip }),
      { initialProps: { skip: 0 } }
    )

    expect(result.current.loading).toBe(true)

    // Change params — should abort first request
    rerender({ skip: 10 })

    // Resolve second request
    resolveSecond!(
      new Response(JSON.stringify(mockUsersPage2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should have page 2 data, not page 1
    expect(result.current.data!.users[0].id).toBe(2)

    // First fetch should have been called with an aborted signal
    const firstCall = fetchSpy.mock.calls[0]
    const firstSignal = (firstCall[1] as RequestInit)?.signal
    expect(firstSignal?.aborted).toBe(true)
  })

  it('does not set error state when request is aborted', async () => {
    fetchSpy
      .mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            const signal = (init as RequestInit)?.signal
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(
                  new DOMException('The operation was aborted.', 'AbortError')
                )
              })
            }
          })
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockUsers), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      )

    const { result, rerender } = renderHook(
      ({ skip }) => useUsers({ limit: 10, skip }),
      { initialProps: { skip: 0 } }
    )

    // Change params to trigger abort
    rerender({ skip: 10 })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Error should be null — abort is not an error
    expect(result.current.error).toBeNull()
    expect(result.current.data).not.toBeNull()
  })

  it('aborts the request on unmount', async () => {
    fetchSpy.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves
        })
    )

    const { result, unmount } = renderHook(() =>
      useUsers({ limit: 10, skip: 0 })
    )

    expect(result.current.loading).toBe(true)

    unmount()

    const firstCall = fetchSpy.mock.calls[0]
    const signal = (firstCall[1] as RequestInit)?.signal
    expect(signal?.aborted).toBe(true)
  })
})
