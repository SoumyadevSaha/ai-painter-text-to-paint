import express from 'express';

import { createMockImageDataUrl } from '../utils/mockImage.js';

const router = express.Router();

router.route('/').get(async (req, res) => {
    res.json({
        message: 'Mock preview image route is ready',
        provider: 'mock',
    });
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt?.trim()) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const normalizedPrompt = prompt.trim();
        const photo = createMockImageDataUrl(normalizedPrompt);
        const provider = 'mock';

        res.status(200).json({ photo, provider });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to generate image', error: error.message });
    }
});

export default router;
