import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MyCreations from '../../pages/MyCreations';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('MyCreations page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads private work and publishes a post to the community', async () => {
    const authFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              _id: 'post-1',
              ownerName: 'Soumyadev',
              prompt: 'A glowing palace in the monsoon',
              photo: 'data:image/svg+xml;base64,PHN2Zy8+',
              isCommunity: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            _id: 'post-1',
            ownerName: 'Soumyadev',
            prompt: 'A glowing palace in the monsoon',
            photo: 'data:image/svg+xml;base64,PHN2Zy8+',
            isCommunity: true,
          },
        }),
      });

    mockUseAuth.mockReturnValue({
      authFetch,
      user: { _id: 'user-1', name: 'Soumyadev' },
    });

    render(
      <MemoryRouter>
        <MyCreations />
      </MemoryRouter>
    );

    expect(await screen.findByText('Share to Community')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Share to Community' }));

    await waitFor(() => {
      expect(authFetch).toHaveBeenNthCalledWith(2, '/api/v1/post/post-1/community', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCommunity: true }),
      });
    });

    expect(await screen.findByText('Remove from Community')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });
});
