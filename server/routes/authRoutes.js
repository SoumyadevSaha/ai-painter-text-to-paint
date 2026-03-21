import express from 'express';
import * as dotenv from 'dotenv';

import { isMongoReady } from '../mongodb/connect.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../mongodb/models/user.js';
import Post from '../mongodb/models/post.js';
import {
    createLocalUser,
    deleteLocalUser,
    findLocalUserByEmail,
    findLocalUserById,
    updateLocalUserPassword,
} from '../storage/localUsersStore.js';
import { deleteLocalPostsByUser, removeLocalReactionsByUser } from '../storage/localPostsStore.js';
import { destroyCloudinaryAsset } from '../utils/cloudinaryAssets.js';
import { sanitizeUser, signAuthToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

dotenv.config();

const router = express.Router();

const normalizeEmail = (email) => email.trim().toLowerCase();
const findUserById = async (userId) => (
    isMongoReady()
        ? User.findById(userId)
        : findLocalUserById(userId)
);

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = isMongoReady()
            ? await User.findOne({ email: normalizedEmail })
            : await findLocalUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account already exists for this email' });
        }

        const passwordHash = hashPassword(password.trim());
        const createdUser = isMongoReady()
            ? await User.create({
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
            })
            : await createLocalUser({
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
            });

        res.status(201).json({
            success: true,
            token: signAuthToken(createdUser),
            user: sanitizeUser(createdUser),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = isMongoReady()
            ? await User.findOne({ email: normalizedEmail })
            : await findLocalUserByEmail(normalizedEmail);

        if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.status(200).json({
            success: true,
            token: signAuthToken(user),
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to log in', error: error.message });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword?.trim() || !newPassword?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        const user = await findUserById(req.user._id);

        if (!user || !verifyPassword(currentPassword.trim(), user.passwordHash)) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const nextPasswordHash = hashPassword(newPassword.trim());

        if (isMongoReady()) {
            user.passwordHash = nextPasswordHash;
            await user.save();
        } else {
            await updateLocalUserPassword({
                userId: req.user._id,
                passwordHash: nextPasswordHash,
            });
        }

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update password', error: error.message });
    }
});

router.delete('/me', requireAuth, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password?.trim()) {
            return res.status(400).json({ success: false, message: 'Password is required to delete the account' });
        }

        const user = await findUserById(req.user._id);

        if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
        }

        if (isMongoReady()) {
            await Post.updateMany({}, {
                $pull: {
                    reactions: { userId: req.user._id },
                },
            });
        } else {
            await removeLocalReactionsByUser(req.user._id);
        }

        const posts = isMongoReady()
            ? await Post.find({ userId: req.user._id })
            : await deleteLocalPostsByUser(req.user._id);

        for (const post of posts) {
            await destroyCloudinaryAsset({
                photo: post.photo,
                photoPublicId: post.photoPublicId,
            });
        }

        if (isMongoReady()) {
            await Post.deleteMany({ userId: req.user._id });
            await User.findByIdAndDelete(req.user._id);
        } else {
            await deleteLocalUser(req.user._id);
        }

        res.status(200).json({ success: true, message: 'Account and all creations deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
    }
});

export default router;
