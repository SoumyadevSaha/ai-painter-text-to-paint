import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { generateImageWithPuter, isPuterFallbackEnabled } from '../utils/puter';
import { FormField, Loader } from '../components';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const CreatePainting = () => {
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const [form, setForm] = useState({
    prompt: '',
    photo: '',
  });
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [savedPostId, setSavedPostId] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerMessage, setProviderMessage] = useState('');

  const createPost = async ({ photo, isCommunity }) => {
    const response = await authFetch('/api/v1/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: form.prompt.trim(),
        photo,
        isCommunity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to create post');
    }

    return data.data;
  };

  const publishSavedPost = async (postId) => {
    const response = await authFetch(`/api/v1/post/${postId}/community`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCommunity: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to share post');
    }

    return data.data;
  };

  const finalizeGeneratedImage = async (photo, message) => {
    setForm((currentForm) => ({ ...currentForm, photo }));
    setSavedPostId('');

    if (!saveToLibrary) {
      setProviderMessage(message);
      return;
    }

    try {
      const savedPost = await createPost({ photo, isCommunity: false });
      setSavedPostId(savedPost._id);
      setProviderMessage(`${message} Saved to your private library.`);
    } catch (saveError) {
      setProviderMessage(message);
      setError(`Image generated, but auto-save failed: ${saveError.message}`);
    }
  };

  const tryPuterFallback = async () => {
    if (!isPuterFallbackEnabled()) {
      throw new Error('No AI provider is currently available. Add OPENAI_API_KEY or enable Puter fallback.');
    }

    return generateImageWithPuter(form.prompt.trim());
  };

  const generateImage = async () => {
    if (form.prompt.trim()) {
      setError('');
      setProviderMessage('');

      try {
        setGeneratingImg(true);
        const response = await fetch(`${API_URL}/api/v1/dalle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: form.prompt.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || data?.message || 'Failed to generate image');
        }

        let generatedPhoto = data.photo;
        let nextMessage = 'AI provider unavailable, using local preview fallback.';

        if (data.provider === 'mock' && isPuterFallbackEnabled()) {
          try {
            const puterResult = await tryPuterFallback();
            generatedPhoto = puterResult.photo;
            nextMessage = 'Image generated with Puter browser fallback.';
            await finalizeGeneratedImage(generatedPhoto, nextMessage);
            return;
          } catch (puterError) {
            nextMessage = 'AI provider unavailable, using local preview fallback.';
          }
        } else if (data.provider === 'openai') {
          nextMessage = 'Image generated with OpenAI.';
        }

        await finalizeGeneratedImage(generatedPhoto, nextMessage);
      } catch (error) {
        try {
          const puterResult = await tryPuterFallback();
          await finalizeGeneratedImage(puterResult.photo, 'Image generated with Puter browser fallback.');
        } catch (fallbackError) {
          setError(fallbackError.message || error.message);
        }
      } finally {
        setGeneratingImg(false);
      }
    } else {
      setError('Please enter a prompt');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt.trim() && form.photo.trim()) {
      setError('');
      setLoading(true);

      try {
        if (savedPostId) {
          await publishSavedPost(savedPostId);
        } else {
          const createdPost = await createPost({
            photo: form.photo,
            isCommunity: true,
          });
          setSavedPostId(createdPost._id);
        }

        navigate('/');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please add a prompt and generate an image first');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'prompt') {
      setSavedPostId('');
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  return (
    <section className='grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]'>
      <form className='glass-panel-strong order-2 rounded-[34px] px-6 py-8 sm:px-8 lg:order-1' onSubmit={handleSubmit}>
        <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
          Studio Mode
        </div>
        <h1 className='font-display gradient-text mt-5 pb-1 text-4xl leading-[1.08] sm:text-5xl'>
          Create something bold, warm, and worth sharing.
        </h1>
        <p className='mt-4 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
          Build your artwork prompt, generate a frame, and decide whether it should stay in your private library or go straight to the community.
        </p>
        <p className='mt-3 text-sm leading-7 text-[#5f6776]'>
          Signed in as <span className='font-semibold text-[#1b2235]'>{user?.name}</span>. Private saves can happen automatically as soon as the image is generated.
        </p>

        <div className='mt-8 space-y-4'>
          {error && (
            <p className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </p>
          )}

          {providerMessage && (
            <p className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              {providerMessage}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="A cinematic botanical observatory floating above monsoon clouds..."
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe={true}
            handleSurpriseMe={handleSurpriseMe}
          />

          <label className='field-surface flex items-center justify-between gap-4 rounded-[22px] px-4 py-4'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#586578]'>Save to Private Library</p>
              <p className='mt-2 text-sm leading-6 text-[#5d6675]'>
                Automatically save each generated artwork to My Creations. Uncheck to preview without saving.
              </p>
            </div>

            <input
              type='checkbox'
              checked={saveToLibrary}
              onChange={(event) => setSaveToLibrary(event.target.checked)}
              className='h-5 w-5 accent-[#e66a4f]'
            />
          </label>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <button
              type='button'
              onClick={generateImage}
              className='btn-secondary rounded-full px-6 py-3 text-sm font-semibold'
            >
              {generatingImg ? 'Generating...' : 'Generate Image'}
            </button>
            <button
              type='submit'
              className='btn-primary rounded-full px-6 py-3 text-sm font-semibold'
            >
              {loading ? 'Sharing...' : 'Share to Community'}
            </button>
          </div>
        </div>
      </form>

      <aside className='order-1 lg:order-2'>
        <div className='glass-panel sticky top-6 rounded-[34px] px-6 py-8'>
          <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a6c5d]'>Live Preview</p>
          <h2 className='font-display mt-4 pb-1 text-3xl leading-[1.08] text-[#1b2235]'>Your composition board</h2>
          <p className='mt-3 text-sm leading-7 text-[#616b79]'>
            Generate first, review the framing, then publish only the image you want attached to your name.
          </p>

          <div className="preview-stage relative mt-8 flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] p-5">
            {form.photo ? (
              <>
                <img 
                  src={form.photo}
                  alt={form.prompt}
                  className='relative z-[1] h-full w-full rounded-[22px] object-contain'
                />
                <div className='preview-caption absolute inset-x-5 bottom-5 z-[2] rounded-[22px] px-4 py-4'>
                  <p className='text-[11px] font-bold uppercase tracking-[0.22em] text-white/70'>
                    Created by {user?.name || 'You'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-white'>
                    {form.prompt || 'Your prompt will appear here once you write one.'}
                  </p>
                </div>
              </>
            ) : (
              <div className='relative z-[1] flex flex-col items-center text-center'>
                <img 
                  src={preview}
                  alt="preview"
                  className='h-40 w-40 object-contain opacity-90'
                />
                <p className='mt-5 max-w-xs text-sm leading-6 text-[#5f6776]'>
                  Your generated frame will appear here with the provider status shown above the form.
                </p>
              </div>
            )}

            {generatingImg && (
              <div className='absolute inset-0 z-10 flex items-center justify-center bg-[rgba(27,34,53,0.58)] backdrop-blur-sm'>
                <Loader />
              </div>  
            )}
          </div>

        </div>
      </aside>
    </section>
  );
};

export default CreatePainting;
