const DEFAULT_MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_DATA_URL_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,/i;
const REMOTE_URL_PATTERN = /^https?:\/\//i;
const POST_SOURCE_TYPES = ['upload', 'generated'];
const DEFAULT_POST_SOURCE_TYPE = 'generated';

const getMaxSourceImageBytes = () => {
    const configuredValue = Number(process.env.MAX_SOURCE_IMAGE_BYTES);
    return Number.isFinite(configuredValue) && configuredValue > 0
        ? configuredValue
        : DEFAULT_MAX_SOURCE_IMAGE_BYTES;
};

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

const normalizeSourceType = (sourceType) => (
    POST_SOURCE_TYPES.includes(sourceType) ? sourceType : DEFAULT_POST_SOURCE_TYPE
);

const isRemoteUrl = (value) => REMOTE_URL_PATTERN.test(value || '');

const estimateSourceImageBytes = (photo) => {
    if (!photo) {
        return 0;
    }

    if (photo.startsWith('data:')) {
        const base64Payload = photo.split(',')[1] || '';
        return Buffer.byteLength(base64Payload, 'base64');
    }

    return Buffer.byteLength(photo, 'utf8');
};

const validatePostPhoto = ({ photo, sourceType }) => {
    const normalizedPhoto = photo?.trim();
    const normalizedSourceType = normalizeSourceType(sourceType);

    if (!normalizedPhoto) {
        return {
            statusCode: 400,
            message: 'Photo is required',
        };
    }

    if (normalizedPhoto.startsWith('data:') && !IMAGE_DATA_URL_PATTERN.test(normalizedPhoto)) {
        return {
            statusCode: 400,
            message: 'Only image uploads are allowed. Videos, audio, documents, and executables are not supported.',
        };
    }

    if (!normalizedPhoto.startsWith('data:') && !isRemoteUrl(normalizedPhoto)) {
        return {
            statusCode: 400,
            message: 'Photo must be an image data URL or a remote image URL.',
        };
    }

    if (normalizedSourceType === 'upload' && !normalizedPhoto.startsWith('data:')) {
        return {
            statusCode: 400,
            message: 'Uploaded files must be sent as image data URLs.',
        };
    }

    const sourceImageBytes = estimateSourceImageBytes(normalizedPhoto);
    const maxSourceImageBytes = getMaxSourceImageBytes();

    if (sourceImageBytes > maxSourceImageBytes) {
        return {
            statusCode: 413,
            message: `Image payload is too large. Maximum supported size is ${formatBytes(maxSourceImageBytes)}.`,
        };
    }

    return null;
};

export {
    DEFAULT_MAX_SOURCE_IMAGE_BYTES,
    estimateSourceImageBytes,
    formatBytes,
    getMaxSourceImageBytes,
    isRemoteUrl,
    normalizeSourceType,
    validatePostPhoto,
};
