import test from 'node:test';
import assert from 'node:assert/strict';

import mongoose from 'mongoose';

import app from '../../index.js';
import User from '../../mongodb/models/user.js';
import Post from '../../mongodb/models/post.js';

test('optional Mongo integration: auth and post flow', { concurrency: false }, async (t) => {
    if (!process.env.MONGODB_TEST_URI) {
        t.skip('Set MONGODB_TEST_URI to run Mongo integration tests.');
        return;
    }

    const dbName = `ai_painter_test_${Date.now()}`;
    await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName });

    const server = await new Promise((resolve) => {
        const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    });

    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Mongo Tester',
                email: 'mongo@example.com',
                password: 'mongo-secret',
            }),
        });

        const registerPayload = await registerResponse.json();
        assert.equal(registerResponse.status, 201);

        const createResponse = await fetch(`${baseUrl}/api/v1/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${registerPayload.token}`,
            },
            body: JSON.stringify({
                prompt: 'Mongo-backed creation',
                photo: 'data:image/svg+xml;base64,PHN2Zy8+',
                isCommunity: true,
            }),
        });

        const createdPost = await createResponse.json();
        assert.equal(createResponse.status, 201);
        assert.equal(createdPost.data.isCommunity, true);

        const communityResponse = await fetch(`${baseUrl}/api/v1/post`);
        const communityPayload = await communityResponse.json();
        assert.equal(communityResponse.status, 200);
        assert.equal(communityPayload.data.length, 1);

        assert.equal(await User.countDocuments({}), 1);
        assert.equal(await Post.countDocuments({}), 1);
    } finally {
        await mongoose.connection.dropDatabase();
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
        await mongoose.disconnect();
    }
});
