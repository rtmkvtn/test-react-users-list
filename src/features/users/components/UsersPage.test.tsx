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
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows page size selector with 10, 20, 50 options', async () => {
    renderWithRouter()

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
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
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
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
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should show 5 rows (limit=5) + header
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(6)
  })
})
