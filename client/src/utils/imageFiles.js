const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_PATTERN = /^image\/[a-z0-9.+-]+$/i;
const SUPPORTED_IMAGE_EXTENSIONS = [
  '.apng',
  '.avif',
  '.bmp',
  '.gif',
  '.heic',
  '.heif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.tif',
  '.tiff',
  '.webp',
];

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 bytes';
  }

  if (bytes < 1024) {
    return `${bytes} bytes`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  }

  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
};

const hasSupportedImageExtension = (name = '') =>
  SUPPORTED_IMAGE_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension));

const validateImageUploadFile = (file) => {
  if (!file) {
    return 'Please choose an image to upload.';
  }

  const isSupportedImage =
    IMAGE_MIME_PATTERN.test(file.type || '') || hasSupportedImageExtension(file.name);

  if (!isSupportedImage) {
    return 'Only image files and GIFs are allowed.';
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `Images must be ${formatBytes(MAX_IMAGE_UPLOAD_BYTES)} or smaller to stay within the Cloudinary free tier.`;
  }

  return '';
};

const readFileAsDataUrl = (fileOrBlob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read the selected image'));
    reader.readAsDataURL(fileOrBlob);
  });

const normalizeGeneratedPhotoSource = async (photo) => {
  if (!photo) {
    throw new Error('No image was returned');
  }

  if (typeof Blob !== 'undefined' && photo instanceof Blob) {
    return readFileAsDataUrl(photo);
  }

  if (typeof photo !== 'string') {
    throw new Error('Generated image format is unsupported');
  }

  if (photo.startsWith('blob:')) {
    const response = await fetch(photo);

    if (!response.ok) {
      throw new Error('Failed to prepare the generated image');
    }

    const blob = await response.blob();
    return readFileAsDataUrl(blob);
  }

  return photo;
};

const getImageExtensionFromSource = (photo = '') => {
  if (photo.startsWith('data:')) {
    const mimeMatch = photo.match(/^data:(image\/[a-z0-9.+-]+);/i);
    const mimeType = mimeMatch?.[1]?.toLowerCase();

    if (mimeType === 'image/jpeg') {
      return 'jpg';
    }

    if (mimeType === 'image/svg+xml') {
      return 'svg';
    }

    if (mimeType?.startsWith('image/')) {
      return mimeType.replace('image/', '').replace('x-icon', 'ico');
    }
  }

  try {
    const pathname = new URL(photo).pathname;
    const extensionMatch = pathname.match(/\.([a-z0-9]+)$/i);

    if (extensionMatch?.[1]) {
      return extensionMatch[1].toLowerCase();
    }
  } catch {
    return 'png';
  }

  return 'png';
};

export {
  MAX_IMAGE_UPLOAD_BYTES,
  formatBytes,
  getImageExtensionFromSource,
  normalizeGeneratedPhotoSource,
  readFileAsDataUrl,
  validateImageUploadFile,
};
