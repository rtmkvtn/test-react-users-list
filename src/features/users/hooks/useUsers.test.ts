import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
