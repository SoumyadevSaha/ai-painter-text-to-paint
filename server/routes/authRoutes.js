import express from 'express';
import * as dotenv from 'dotenv';

import { isMongoReady } from '../mongodb/connect.js';
import { requireAuth } from '../middleware/auth.js';
import User from '../mongodb/models/user.js';
import { createLocalUser, findLocalUserByEmail } from '../storage/localUsersStore.js';
import { sanitizeUser, signAuthToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

dotenv.config();

const router = express.Router();

const normalizeEmail = (email) => email.trim().toLowerCase();

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

export default router;
