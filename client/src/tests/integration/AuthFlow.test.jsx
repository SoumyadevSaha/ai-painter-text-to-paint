import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Auth from '../../pages/Auth';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const renderAuthPage = (initialEntries = ['/auth']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path='/auth' element={<Auth />} />
        <Route path='/my-creations' element={<div>My Creations Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Auth page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('logs in an existing user and redirects to the studio page', async () => {
    const login = vi.fn().mockResolvedValue({
      token: 'demo-token',
      user: { _id: 'user-1', name: 'Soumyadev' },
    });

    mockUseAuth.mockReturnValue({
      login,
      register: vi.fn(),
    });

    renderAuthPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'soumyadev@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'top-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'soumyadev@example.com',
        password: 'top-secret',
      });
    });

    expect(await screen.findByText('My Creations Page')).toBeInTheDocument();
  });

  it('registers a new user and redirects to the studio page', async () => {
    const register = vi.fn().mockResolvedValue({
      token: 'demo-token',
      user: { _id: 'user-2', name: 'Soumyadev' },
    });

    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      register,
    });

    renderAuthPage();

    fireEvent.click(screen.getByRole('button', { name: 'register' }));

    fireEvent.change(screen.getByLabelText('Display name'), {
      target: { value: 'Soumyadev' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'soumyadev@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'top-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: 'Soumyadev',
        email: 'soumyadev@example.com',
        password: 'top-secret',
      });
    });

    expect(await screen.findByText('My Creations Page')).toBeInTheDocument();
  });
});
