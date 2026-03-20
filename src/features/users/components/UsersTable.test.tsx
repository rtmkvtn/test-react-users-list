import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { IUser } from '../types'
import { UsersTable } from './UsersTable'

const mockUsers: IUser[] = [
  {
    id: 1,
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily@example.com',
    phone: '+1 555-0100',
    age: 28,
    image: 'https://dummyjson.com/icon/emilys/128',
    address: { city: 'Phoenix' },
  },
  {
    id: 2,
    firstName: 'Michael',
    lastName: 'Williams',
    email: 'michael@example.com',
    phone: '+1 555-0200',
    age: 35,
    image: 'https://dummyjson.com/icon/michaelw/128',
    address: { city: 'Houston' },
  },
]

describe('UsersTable', () => {
  it('shows loading state', () => {
    render(<UsersTable loading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders users in a table with correct columns', () => {
    render(<UsersTable users={mockUsers} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()

    expect(screen.getByText('Emily Johnson')).toBeInTheDocument()
    expect(screen.getByText('emily@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 555-0100')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('Phoenix')).toBeInTheDocument()
  })

  it('renders avatars as rounded images', () => {
    render(<UsersTable users={mockUsers} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', mockUsers[0].image)
    expect(images[0]).toHaveClass('rounded-full')
  })

  it('shows empty state when no users', () => {
    render(<UsersTable users={[]} />)
    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('shows error state with retry button', async () => {
    const onRetry = vi.fn()
    render(<UsersTable error="Network error" onRetry={onRetry} />)

    expect(screen.getByText('Network error')).toBeInTheDocument()

    const retryBtn = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
