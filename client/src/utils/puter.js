const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';

let puterLoaderPromise;

const isPuterFallbackEnabled = () =>
  import.meta.env.VITE_ENABLE_PUTER_FALLBACK !== 'false';

const loadPuter = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Puter fallback is only available in the browser');
  }

  if (window.puter?.ai?.txt2img) {
    return window.puter;
  }

  if (!puterLoaderPromise) {
    puterLoaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${PUTER_SCRIPT_URL}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.puter), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Puter.js')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = PUTER_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.puter);
      script.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(script);
    });
  }

  const puter = await puterLoaderPromise;

  if (!puter?.ai?.txt2img) {
    throw new Error('Puter image generation is unavailable');
  }

  return puter;
};

const generateImageWithPuter = async (prompt) => {
  const puter = await loadPuter();
  const image = await puter.ai.txt2img(prompt, {
    model: import.meta.env.VITE_PUTER_MODEL || 'gpt-image-1.5',
  });

  if (image?.src) {
    return {
      photo: image.src,
      provider: 'puter',
    };
  }

  throw new Error('Puter did not return an image');
};

export { generateImageWithPuter, isPuterFallbackEnabled };
