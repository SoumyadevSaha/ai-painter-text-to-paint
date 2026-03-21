import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = () => Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

let didConfigureCloudinary = false;

const ensureCloudinaryConfig = () => {
    if (!isCloudinaryConfigured()) {
        return false;
    }

    if (!didConfigureCloudinary) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        didConfigureCloudinary = true;
    }

    return true;
};

const extractCloudinaryPublicId = (photoUrl) => {
    if (!photoUrl?.includes('/upload/')) {
        return null;
    }

    const [, pathAfterUpload] = photoUrl.split('/upload/');

    if (!pathAfterUpload) {
        return null;
    }

    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '') || null;
};

const uploadToCloudinary = async (photo, folder) => {
    ensureCloudinaryConfig();

    return cloudinary.uploader.upload(photo, {
        folder,
        resource_type: 'image',
    });
};

const destroyCloudinaryAsset = async ({ photo, photoPublicId }) => {
    if (!ensureCloudinaryConfig()) {
        return false;
    }

    const publicId = photoPublicId || extractCloudinaryPublicId(photo);

    if (!publicId) {
        return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result?.result === 'ok' || result?.result === 'not found';
};

export {
    destroyCloudinaryAsset,
    isCloudinaryConfigured,
    uploadToCloudinary,
};
