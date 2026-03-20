import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Home from '../../pages/Home';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Home gallery reactions', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows public reactions and lets a signed-in user like a community post', async () => {
    const authFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              _id: 'post-1',
              ownerName: 'Soumyadev',
              prompt: 'An editorial cityscape at dusk',
              photo: 'data:image/svg+xml;base64,PHN2Zy8+',
              isCommunity: true,
              likeCount: 2,
              dislikeCount: 0,
              viewerReaction: null,
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
            prompt: 'An editorial cityscape at dusk',
            photo: 'data:image/svg+xml;base64,PHN2Zy8+',
            isCommunity: true,
            likeCount: 3,
            dislikeCount: 0,
            viewerReaction: 'like',
          },
        }),
      });

    mockUseAuth.mockReturnValue({
      authFetch,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Like 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Like 2' }));

    await waitFor(() => {
      expect(authFetch).toHaveBeenNthCalledWith(2, '/api/v1/post/post-1/reaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction: 'like' }),
      });
    });

    expect(await screen.findByRole('button', { name: 'Like 3' })).toBeInTheDocument();
  });
});
