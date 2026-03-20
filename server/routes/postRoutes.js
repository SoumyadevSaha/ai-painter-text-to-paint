import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import { isMongoReady } from '../mongodb/connect.js';
import { requireAuth } from '../middleware/auth.js';
import Post from '../mongodb/models/post.js';
import {
    createLocalPost,
    getCommunityPosts,
    getUserPosts,
    updateLocalPostCommunityState,
} from '../storage/localPostsStore.js';

dotenv.config();

const router = express.Router();
const DEFAULT_MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;

const isCloudinaryConfigured = () => Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const getMaxSourceImageBytes = () => {
    const configuredValue = Number(process.env.MAX_SOURCE_IMAGE_BYTES);
    return Number.isFinite(configuredValue) && configuredValue > 0
        ? configuredValue
        : DEFAULT_MAX_SOURCE_IMAGE_BYTES;
};

const isRemoteUrl = (value) => /^https?:\/\//i.test(value);

const shouldMirrorRemoteImagesToCloudinary = () =>
    process.env.CLOUDINARY_MIRROR_REMOTE_IMAGES === 'true';

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

if (isCloudinaryConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

router.route('/').get(async (req, res) => {
    try {
        const posts = isMongoReady()
            ? await Post.find({ isCommunity: true }).sort({ createdAt: -1 })
            : await getCommunityPosts();

        res.status(200).json({ success: true, message: 'Community posts', data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load posts', error: error.message });
    }
});

router.get('/mine', requireAuth, async (req, res) => {
    try {
        const posts = isMongoReady()
            ? await Post.find({ userId: req.user._id }).sort({ createdAt: -1 })
            : await getUserPosts(req.user._id);

        res.status(200).json({ success: true, message: 'Your posts', data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load your posts', error: error.message });
    }
});

router.route('/').post(requireAuth, async (req, res) => {
    try {
        const { prompt, photo, isCommunity = false } = req.body;

        if (!prompt?.trim() || !photo?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Prompt and photo are required',
            });
        }

        const normalizedPost = {
            userId: req.user._id,
            ownerName: req.user.name,
            prompt: prompt.trim(),
            photo: photo.trim(),
            isCommunity: Boolean(isCommunity),
        };

        const sourceImageBytes = estimateSourceImageBytes(normalizedPost.photo);
        const maxSourceImageBytes = getMaxSourceImageBytes();

        if (sourceImageBytes > maxSourceImageBytes) {
            return res.status(413).json({
                success: false,
                message: `Image payload is too large. Maximum supported size is ${maxSourceImageBytes} bytes.`,
            });
        }

        let storedPhoto = normalizedPost.photo;

        if (isCloudinaryConfigured()) {
            const shouldUploadToCloudinary =
                !isRemoteUrl(normalizedPost.photo) || shouldMirrorRemoteImagesToCloudinary();

            if (shouldUploadToCloudinary) {
                const uploadedPhoto = await cloudinary.uploader.upload(normalizedPost.photo, {
                    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ai-painter',
                });
                storedPhoto = uploadedPhoto.secure_url;
            }
        }

        const newPost = isMongoReady()
            ? await Post.create({
                ...normalizedPost,
                photo: storedPhoto,
            })
            : await createLocalPost({
                ...normalizedPost,
                photo: storedPhoto,
            });

        res.status(201).json({ success: true, message: 'Post created successfully', data: newPost });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
    }
});

router.patch('/:postId/community', requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { isCommunity } = req.body;

        if (typeof isCommunity !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isCommunity must be a boolean' });
        }

        const updatedPost = isMongoReady()
            ? await Post.findOneAndUpdate(
                { _id: postId, userId: req.user._id },
                { isCommunity },
                { new: true }
            )
            : await updateLocalPostCommunityState({
                postId,
                userId: req.user._id,
                isCommunity,
            });

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.status(200).json({ success: true, message: 'Post visibility updated', data: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update post visibility', error: error.message });
    }
});

export default router;
