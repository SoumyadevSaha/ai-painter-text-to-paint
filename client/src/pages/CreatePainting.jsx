import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { preview } from '../assets';
import { FormField, Loader } from '../components';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { getRandomPrompt } from '../utils';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  formatBytes,
  readFileAsDataUrl,
  validateImageUploadFile,
} from '../utils/imageFiles';
import { generateImageWithPuter, isPuterFallbackEnabled } from '../utils/puter';

const UploadIcon = () => (
  <svg
    viewBox='0 0 24 24'
    aria-hidden='true'
    className='h-3.5 w-3.5'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.9'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 16V4' />
    <path d='m7 9 5-5 5 5' />
    <path d='M5 20h14' />
  </svg>
);

const CreatePainting = () => {
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  const uploadInputRef = useRef(null);
  const [form, setForm] = useState({
    prompt: '',
    uploadedPhoto: '',
    generatedPhoto: '',
  });
  const [activeSource, setActiveSource] = useState('');
  const [uploadedAsset, setUploadedAsset] = useState(null);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [submittingAction, setSubmittingAction] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const selectedPrompt = form.prompt.trim();
  const selectedPhoto = activeSource === 'upload'
    ? form.uploadedPhoto.trim()
    : activeSource === 'generated'
      ? form.generatedPhoto.trim()
      : '';
  const selectedSourceLabel = activeSource === 'upload' ? 'User Uploaded' : 'AI Generated';

  const createPost = async ({ photo, prompt, isCommunity }) => {
    const response = await authFetch('/api/v1/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        photo,
        sourceType: activeSource === 'upload' ? 'upload' : 'generated',
        isCommunity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to create post');
    }

    return data.data;
  };

  const tryPuterFallback = async () => {
    if (!isPuterFallbackEnabled()) {
      throw new Error('AI image generation is currently unavailable.');
    }

    return generateImageWithPuter(form.prompt.trim());
  };

  const applyGeneratedImage = (photo) => {
    setForm((currentForm) => ({ ...currentForm, generatedPhoto: photo }));
    setActiveSource('generated');
    setStatusMessage('AI image ready.');
  };

  const generateImage = async () => {
    if (!selectedPrompt) {
      setError('Please enter a prompt or description first');
      return;
    }

    setError('');
    setStatusMessage('');

    try {
      setGeneratingImg(true);
      try {
        const puterResult = await tryPuterFallback();
        applyGeneratedImage(puterResult.photo);
      } catch {
        const response = await fetch(`${API_URL}/api/v1/dalle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: selectedPrompt }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || data?.message || 'Failed to generate image');
        }

        applyGeneratedImage(data.photo);
      }
    } catch (generationError) {
      setError(generationError.message || 'Failed to generate image');
    } finally {
      setGeneratingImg(false);
    }
  };

  const ensureSelectedPostIsReady = () => {
    if (!selectedPrompt) {
      throw new Error('Please enter a prompt or description first');
    }

    if (!selectedPhoto) {
      throw new Error('Please generate or upload an image first');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      ensureSelectedPostIsReady();
      setError('');
      setStatusMessage('');
      setSubmittingAction('share');

      await createPost({
        prompt: selectedPrompt,
        photo: selectedPhoto,
        isCommunity: true,
      });

      navigate('/');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingAction('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError('');
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm((currentForm) => ({ ...currentForm, prompt: randomPrompt }));
    setError('');
  };

  const handleUploadChange = async (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    setError('');
    setStatusMessage('');

    const validationMessage = validateImageUploadFile(nextFile);

    if (validationMessage) {
      event.target.value = '';
      setError(validationMessage);
      return;
    }

    try {
      const uploadedPhoto = await readFileAsDataUrl(nextFile);
      setUploadedAsset({
        name: nextFile.name,
        size: nextFile.size,
      });
      setForm((currentForm) => ({ ...currentForm, uploadedPhoto }));
      setActiveSource('upload');
      setStatusMessage('Upload ready.');
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  const handleUploadButtonClick = () => {
    uploadInputRef.current?.click();
  };

  return (
    <section className='grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]'>
      <form className='glass-panel-strong order-2 rounded-[34px] px-6 py-8 sm:px-8 lg:order-1' onSubmit={handleSubmit}>
        <div className='chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]'>
          Studio Mode
        </div>
        <h1 className='font-display gradient-text mt-5 pb-1 text-4xl leading-[1.08] sm:text-5xl'>
          Create something bold, warm, and worth sharing.
        </h1>
        <p className='mt-4 max-w-2xl text-sm leading-7 text-[#5f6776] sm:text-base'>
          Upload your own image or build a fresh one with AI, then share the version that feels ready for the gallery.
        </p>
        <p className='mt-3 text-sm leading-7 text-[#5f6776]'>
          Signed in as <span className='font-semibold text-[#1b2235]'>{user?.name}</span>. Images and GIFs only, up to {formatBytes(MAX_IMAGE_UPLOAD_BYTES)}.
        </p>

        <div className='mt-6 space-y-4'>
          {error && (
            <p className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </p>
          )}

          {statusMessage && (
            <p className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <FormField
            labelName="Prompt / Description"
            type="text"
            name="prompt"
            placeholder="A hand-shot street mural glowing after the rain..."
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe={true}
            handleSurpriseMe={handleSurpriseMe}
            multiline={true}
            rows={4}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type='button'
              onClick={handleUploadButtonClick}
              disabled={submittingAction !== '' || generatingImg}
              className='btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
            >
              <UploadIcon />
              Upload from Device
            </button>

            <input
              ref={uploadInputRef}
              type='file'
              accept='image/*'
              aria-label='Upload from device'
              onChange={handleUploadChange}
              className='sr-only'
              disabled={submittingAction !== '' || generatingImg}
              tabIndex={-1}
            />

            <button
              type='button'
              onClick={generateImage}
              disabled={generatingImg || submittingAction !== ''}
              className='btn-ghost rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
            >
              {generatingImg ? 'Generating...' : 'Generate with AI'}
            </button>

            <button
              type='submit'
              disabled={submittingAction !== '' || generatingImg}
              className='btn-primary rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60'
            >
              {submittingAction === 'share' ? 'Sharing...' : 'Share to Community'}
            </button>
          </div>

          <div className='flex flex-wrap gap-2'>
            {activeSource && (
              <span className='chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]'>
                {selectedSourceLabel}
              </span>
            )}

            {activeSource === 'upload' && uploadedAsset && (
              <span className='chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]'>
                {uploadedAsset.name} • {formatBytes(uploadedAsset.size)}
              </span>
            )}
          </div>
        </div>
      </form>

      <aside className='order-1 lg:order-2'>
        <div className='glass-panel sticky top-6 rounded-[34px] px-6 py-8'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-[#7a6c5d]'>Live Preview</p>
            {activeSource && (
              <span className='chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]'>
                {selectedSourceLabel}
              </span>
            )}
          </div>

          <h2 className='font-display mt-4 pb-1 text-3xl leading-[1.08] text-[#1b2235]'>
            Your composition board
          </h2>
          <p className='mt-3 text-sm leading-7 text-[#616b79]'>
            Upload your own image or generate one with AI, review the framing, then publish only the version you want attached to your name.
          </p>

          <div className="preview-stage relative mt-6 flex min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] p-5">
            {selectedPhoto ? (
              <>
                <img 
                  src={selectedPhoto}
                  alt={selectedPrompt || selectedSourceLabel || 'Preview'}
                  className='relative z-[1] h-full w-full rounded-[22px] object-contain'
                />
                <div className='preview-caption absolute inset-x-5 bottom-5 z-[2] rounded-[22px] px-4 py-4'>
                  <p className='mt-2 text-sm leading-6 text-white'>
                    {selectedPrompt || 'Your prompt or description will appear here.'}
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
                  Your uploaded image or generated frame will appear here once it is ready.
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
