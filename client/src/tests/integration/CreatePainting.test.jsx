import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CreatePainting from '../../pages/CreatePainting';
import { useAuth } from '../../context/AuthContext';
import { generateImageWithPuter } from '../../utils/puter';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../utils/puter', () => ({
  generateImageWithPuter: vi.fn(),
  isPuterFallbackEnabled: vi.fn(() => true),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGenerateImageWithPuter = vi.mocked(generateImageWithPuter);

describe('CreatePainting page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uploads a personal image and shares it as an upload post', async () => {
    const authFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { _id: 'post-1' },
      }),
    });

    mockUseAuth.mockReturnValue({
      authFetch,
      user: { _id: 'user-1', name: 'Soumyadev' },
    });

    render(
      <MemoryRouter>
        <CreatePainting />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Prompt / Description'), {
      target: { value: 'A rain-soaked mural on a brick wall' },
    });

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: {
        files: [
          new File(['hello'], 'mural.png', { type: 'image/png' }),
        ],
      },
    });

    expect(await screen.findByText('Upload ready.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Share to Community' }));

    await waitFor(() => {
      expect(authFetch).toHaveBeenCalledTimes(1);
    });

    expect(authFetch).toHaveBeenCalledWith('/api/v1/post', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String),
    }));

    const [, requestOptions] = authFetch.mock.calls[0];
    const payload = JSON.parse(requestOptions.body);

    expect(payload.prompt).toBe('A rain-soaked mural on a brick wall');
    expect(payload.sourceType).toBe('upload');
    expect(payload.isCommunity).toBe(true);
    expect(payload.photo).toMatch(/^data:image\/png;base64,/);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('uses Puter first for AI generation before touching the server fallback', async () => {
    mockGenerateImageWithPuter.mockResolvedValue({
      photo: 'data:image/png;base64,QUJD',
      provider: 'puter',
    });

    mockUseAuth.mockReturnValue({
      authFetch: vi.fn(),
      user: { _id: 'user-1', name: 'Soumyadev' },
    });

    render(
      <MemoryRouter>
        <CreatePainting />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Prompt / Description'), {
      target: { value: 'A floating botanical observatory' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Generate with AI' }));

    expect(await screen.findByText('AI image ready.')).toBeInTheDocument();
    expect(mockGenerateImageWithPuter).toHaveBeenCalledWith('A floating botanical observatory');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects non-image uploads before posting', async () => {
    mockUseAuth.mockReturnValue({
      authFetch: vi.fn(),
      user: { _id: 'user-1', name: 'Soumyadev' },
    });

    render(
      <MemoryRouter>
        <CreatePainting />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: {
        files: [
          new File(['hello'], 'notes.txt', { type: 'text/plain' }),
        ],
      },
    });

    expect(await screen.findByText('Only image files and GIFs are allowed.')).toBeInTheDocument();
  });
});
