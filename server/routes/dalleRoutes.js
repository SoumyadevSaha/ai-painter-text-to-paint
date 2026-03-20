import express from 'express';
import * as dotenv from 'dotenv';

import { createMockImageDataUrl } from '../utils/mockImage.js';

dotenv.config();

const router = express.Router();

const generateImageWithOpenAI = async (prompt) => {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
            prompt,
            size: '1024x1024',
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const message = data?.error?.message || 'OpenAI image generation failed';
        throw new Error(message);
    }

    const imagePayload = data?.data?.[0];

    if (imagePayload?.b64_json) {
        return `data:image/png;base64,${imagePayload.b64_json}`;
    }

    if (imagePayload?.url) {
        return imagePayload.url;
    }

    throw new Error('OpenAI did not return an image');
};

router.route('/').get(async (req, res) => {
    res.json({
        message: 'Image generation route is ready',
        provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
    });
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt?.trim()) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const normalizedPrompt = prompt.trim();
        let photo = createMockImageDataUrl(normalizedPrompt);
        let provider = 'mock';

        if (process.env.OPENAI_API_KEY) {
            photo = await generateImageWithOpenAI(normalizedPrompt);
            provider = 'openai';
        }

        res.status(200).json({ photo, provider });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to generate image', error: error.message });
    }
});

export default router;
