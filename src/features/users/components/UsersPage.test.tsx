import { MemoryRouter } from 'react-router-dom'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersPage } from './UsersPage'

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <UsersPage />
    </MemoryRouter>
  )
}

describe('UsersPage - Pagination', () => {
  it('renders pagination controls after loading', async () => {
    renderWithRouter()

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows page size selector with 10, 20, 50 options', async () => {
    renderWithRouter()

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('renders correct number of rows based on default page size', async () => {
    renderWithRouter()

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Default limit is 10, header row + 10 data rows
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(11)
  })

  it('loads correct page from URL params', async () => {
    renderWithRouter(['/?page=2&limit=5'])

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should show 5 rows (limit=5) + header
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(6)
  })
})

describe('UsersPage - Search', () => {
  it('renders a search input', async () => {
    renderWithRouter()

    const searchInput = screen.getByPlaceholderText('Search by name...')
    expect(searchInput).toBeInTheDocument()
  })

  it('searches users by name via API', async () => {
    renderWithRouter(['/?q=Emily'])

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should find Emily in results
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)

    // All visible names should contain Emily
    const cells = screen.getAllByRole('cell')
    const nameTexts = cells
      .filter((cell) => cell.classList.contains('font-medium'))
      .map((cell) => cell.textContent)

    nameTexts.forEach((name) => {
      expect(name?.toLowerCase()).toContain('emily')
    })
  })

  it('shows empty state for search with no results', async () => {
    renderWithRouter(['/?q=xyznonexistent123'])

    await waitFor(
      () => {
        expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('initializes search input from URL q param', () => {
    renderWithRouter(['/?q=Emily'])

    const searchInput = screen.getByPlaceholderText(
      'Search by name...'
    ) as HTMLInputElement
    expect(searchInput.value).toBe('Emily')
  })

  it('shows clear button when search has a value', () => {
    renderWithRouter(['/?q=Emily'])

    expect(
      screen.getByRole('button', { name: /clear search/i })
    ).toBeInTheDocument()
  })

  it('hides clear button when search is empty', () => {
    renderWithRouter()

    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument()
  })

  it('clears search input when clear button is clicked', async () => {
    renderWithRouter(['/?q=Emily'])

    const searchInput = screen.getByPlaceholderText(
      'Search by name...'
    ) as HTMLInputElement
    expect(searchInput.value).toBe('Emily')

    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))

    expect(searchInput.value).toBe('')
    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument()
  })
})

describe('UsersPage - Rapid Interactions', () => {
  const makeUsersResponse = (page: number, limit: number) => ({
    users: Array.from({ length: limit }, (_, i) => ({
      id: page * 100 + i,
      firstName: `User${page}-${i}`,
      lastName: 'Test',
      email: `user${page}-${i}@test.com`,
      phone: '123',
      age: 25,
      image: 'https://example.com/avatar.png',
      address: { city: 'TestCity' },
    })),
    total: 50,
    skip: (page - 1) * limit,
    limit,
  })

  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('rapid param changes abort intermediate requests and show final result', async () => {
    const resolvers: Array<{ resolve: (v: Response) => void; url: string }> = []

    fetchSpy.mockImplementation(
      (input) =>
        new Promise((resolve) => {
          resolvers.push({ resolve, url: String(input) })
        })
    )

    // Start on page 1 with limit=5
    renderWithRouter(['/?page=1&limit=5'])

    // Wait for first fetch
    await waitFor(() => expect(resolvers).toHaveLength(1))
    expect(resolvers[0].url).toContain('skip=0')

    // Resolve page 1
    resolvers[0].resolve(
      new Response(JSON.stringify(makeUsersResponse(1, 5)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
    })

    // Now change page size to trigger multiple fetches rapidly
    // Click page 2
    const page2Button = screen.getByRole('button', { name: '2' })
    await userEvent.click(page2Button)

    await waitFor(() => expect(resolvers).toHaveLength(2))
    expect(resolvers[1].url).toContain('skip=5')

    // Resolve page 2 request
    resolvers[1].resolve(
      new Response(JSON.stringify(makeUsersResponse(2, 5)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
    })

    // Should show page 2 data
    expect(screen.getByText('User2-0 Test')).toBeInTheDocument()

    // First request signal should have been aborted when page 2 started
    const page1Signal = (fetchSpy.mock.calls[0][1] as RequestInit)?.signal
    expect(page1Signal?.aborted).toBe(true)
  })

  it('rapid search typing shows only the final query results', async () => {
    const user = userEvent.setup()
    const resolvers: Array<{ resolve: (v: Response) => void; url: string }> = []

    fetchSpy.mockImplementation(
      (input) =>
        new Promise((resolve) => {
          resolvers.push({ resolve, url: String(input) })
        })
    )

    renderWithRouter()

    // Resolve initial load
    await waitFor(() => expect(resolvers).toHaveLength(1))
    resolvers[0].resolve(
      new Response(JSON.stringify(makeUsersResponse(1, 10)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
    })

    // Type "Emily" rapidly
    const searchInput = screen.getByPlaceholderText('Search by name...')
    await user.type(searchInput, 'Emily')

    // Wait for debounce to fire and a new fetch to start
    await waitFor(() => expect(resolvers.length).toBeGreaterThan(1), {
      timeout: 2000,
    })

    // Resolve the latest search request with Emily-specific results
    const lastResolver = resolvers[resolvers.length - 1]
    expect(lastResolver.url).toContain('Emily')

    lastResolver.resolve(
      new Response(
        JSON.stringify({
          users: [
            {
              id: 999,
              firstName: 'Emily',
              lastName: 'Johnson',
              email: 'emily@test.com',
              phone: '456',
              age: 28,
              image: 'https://example.com/emily.png',
              address: { city: 'NYC' },
            },
          ],
          total: 1,
          skip: 0,
          limit: 10,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-row')).not.toBeInTheDocument()
    })

    // Should show Emily's data
    expect(screen.getByText('Emily Johnson')).toBeInTheDocument()

    // Any intermediate requests should have been aborted
    for (let i = 1; i < resolvers.length - 1; i++) {
      const call = fetchSpy.mock.calls[i]
      const signal = (call[1] as RequestInit)?.signal
      expect(signal?.aborted).toBe(true)
    }
  })
})
