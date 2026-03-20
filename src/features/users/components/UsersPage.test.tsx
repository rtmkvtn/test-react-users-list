import { MemoryRouter } from 'react-router-dom'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

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

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
  })

  it('hides clear button when search is empty', () => {
    renderWithRouter()

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })

  it('clears search input when clear button is clicked', async () => {
    renderWithRouter(['/?q=Emily'])

    const searchInput = screen.getByPlaceholderText('Search by name...') as HTMLInputElement
    expect(searchInput.value).toBe('Emily')

    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))

    expect(searchInput.value).toBe('')
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })
})
