import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/create-new']}>
      <Routes>
        <Route path='/auth' element={<div>Auth Page</div>} />
        <Route
          path='/create-new'
          element={(
            <ProtectedRoute>
              <div>Private Studio</div>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading message while the auth session is being checked', () => {
    mockUseAuth.mockReturnValue({
      authReady: false,
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Checking your studio session...')).toBeInTheDocument();
  });

  it('redirects guests to the auth page', () => {
    mockUseAuth.mockReturnValue({
      authReady: true,
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('renders the protected content for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      authReady: true,
      isAuthenticated: true,
    });

    renderProtectedRoute();

    expect(screen.getByText('Private Studio')).toBeInTheDocument();
  });
});
