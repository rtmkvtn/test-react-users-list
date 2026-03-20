import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders the users catalog page', async () => {
    render(<App />)
    expect(screen.getByText('Users Catalog')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Should have loaded some users
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
  })
})
