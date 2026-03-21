import express from 'express';
import * as dotenv from 'dotenv';

import { isMongoReady } from '../mongodb/connect.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import Post from '../mongodb/models/post.js';
import {
    createLocalPost,
    deleteLocalPost,
    getCommunityPosts,
    getUserPosts,
    updateLocalPostCommunityState,
    updateLocalPostReaction,
} from '../storage/localPostsStore.js';
import {
    destroyCloudinaryAsset,
    isCloudinaryConfigured,
    uploadToCloudinary,
} from '../utils/cloudinaryAssets.js';

dotenv.config();

const router = express.Router();
const DEFAULT_MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;

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

const serializePost = (post, viewerId = null) => {
    const postObject = post?.toObject ? post.toObject() : { ...post };
    const reactions = Array.isArray(postObject.reactions) ? postObject.reactions : [];
    const viewerReaction = viewerId
        ? reactions.find((reaction) => reaction.userId === viewerId)?.value || null
        : null;

    return {
        ...postObject,
        likeCount: reactions.filter((reaction) => reaction.value === 'like').length,
        dislikeCount: reactions.filter((reaction) => reaction.value === 'dislike').length,
        viewerReaction,
    };
};

router.route('/').get(optionalAuth, async (req, res) => {
    try {
        const posts = isMongoReady()
            ? await Post.find({ isCommunity: true }).sort({ createdAt: -1 })
            : await getCommunityPosts();

        res.status(200).json({
            success: true,
            message: 'Community posts',
            data: posts.map((post) => serializePost(post, req.user?._id || null)),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load posts', error: error.message });
    }
});

router.get('/mine', requireAuth, async (req, res) => {
    try {
        const posts = isMongoReady()
            ? await Post.find({ userId: req.user._id }).sort({ createdAt: -1 })
            : await getUserPosts(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Your posts',
            data: posts.map((post) => serializePost(post, req.user._id)),
        });
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
            reactions: [],
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
        let storedPhotoPublicId = null;

        if (isCloudinaryConfigured()) {
            const shouldUploadToCloudinary =
                !isRemoteUrl(normalizedPost.photo) || shouldMirrorRemoteImagesToCloudinary();

            if (shouldUploadToCloudinary) {
                const uploadedPhoto = await uploadToCloudinary(
                    normalizedPost.photo,
                    process.env.CLOUDINARY_UPLOAD_FOLDER || 'ai-painter'
                );
                storedPhoto = uploadedPhoto.secure_url;
                storedPhotoPublicId = uploadedPhoto.public_id || null;
            }
        }

        const newPost = isMongoReady()
            ? await Post.create({
                ...normalizedPost,
                photo: storedPhoto,
                photoPublicId: storedPhotoPublicId,
            })
            : await createLocalPost({
                ...normalizedPost,
                photo: storedPhoto,
                photoPublicId: storedPhotoPublicId,
            });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: serializePost(newPost, req.user._id),
        });
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

        res.status(200).json({
            success: true,
            message: 'Post visibility updated',
            data: serializePost(updatedPost, req.user._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update post visibility', error: error.message });
    }
});

router.post('/:postId/reaction', requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { reaction } = req.body;

        if (![null, 'like', 'dislike'].includes(reaction)) {
            return res.status(400).json({
                success: false,
                message: 'reaction must be one of: like, dislike, or null',
            });
        }

        let updatedPost;

        if (isMongoReady()) {
            const post = await Post.findOne({ _id: postId, isCommunity: true });

            if (!post) {
                return res.status(404).json({ success: false, message: 'Community post not found' });
            }

            const existingReactionIndex = post.reactions.findIndex((item) => item.userId === req.user._id);

            if (!reaction) {
                if (existingReactionIndex !== -1) {
                    post.reactions.splice(existingReactionIndex, 1);
                }
            } else if (existingReactionIndex === -1) {
                post.reactions.push({ userId: req.user._id, value: reaction });
            } else {
                post.reactions[existingReactionIndex] = { userId: req.user._id, value: reaction };
            }

            await post.save();
            updatedPost = post;
        } else {
            updatedPost = await updateLocalPostReaction({
                postId,
                userId: req.user._id,
                reaction,
            });

            if (!updatedPost) {
                return res.status(404).json({ success: false, message: 'Community post not found' });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Reaction updated',
            data: serializePost(updatedPost, req.user._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update reaction', error: error.message });
    }
});

router.delete('/:postId', requireAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        const existingPost = isMongoReady()
            ? await Post.findOne({ _id: postId, userId: req.user._id })
            : (await getUserPosts(req.user._id)).find((post) => post._id === postId) || null;

        if (!existingPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        await destroyCloudinaryAsset({
            photo: existingPost.photo,
            photoPublicId: existingPost.photoPublicId,
        });

        if (isMongoReady()) {
            await Post.deleteOne({ _id: postId, userId: req.user._id });
        } else {
            await deleteLocalPost({ postId, userId: req.user._id });
        }

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
    }
});

export default router;
