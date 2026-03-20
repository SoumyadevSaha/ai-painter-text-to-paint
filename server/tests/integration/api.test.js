import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import app from '../../index.js';

const makeServer = async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'ai-painter-tests-'));
    const postsFile = path.join(tempDir, 'posts.json');
    const usersFile = path.join(tempDir, 'users.json');

    process.env.LOCAL_POSTS_FILE = postsFile;
    process.env.LOCAL_USERS_FILE = usersFile;
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.MAX_SOURCE_IMAGE_BYTES = '5242880';
    delete process.env.MONGODB_URL;
    delete process.env.OPENAI_API_KEY;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const server = await new Promise((resolve) => {
        const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    });

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const cleanup = async () => {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
        delete process.env.LOCAL_POSTS_FILE;
        delete process.env.LOCAL_USERS_FILE;
        delete process.env.JWT_SECRET;
    };

    return { baseUrl, cleanup, postsFile, usersFile };
};

const registerUser = async (baseUrl, overrides = {}) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: 'Soumya',
            email: 'soumya@example.com',
            password: 'super-secret-password',
            ...overrides,
        }),
    });

    const payload = await response.json();
    return { response, payload };
};

test('health endpoint reports local-json fallback mode', { concurrency: false }, async () => {
    const { baseUrl, cleanup } = await makeServer();

    try {
        const response = await fetch(`${baseUrl}/api/v1/health`);
        const payload = await response.json();

        assert.equal(response.status, 200);
        assert.equal(payload.status, 'ok');
        assert.equal(payload.storageMode, 'local-json');
        assert.equal(payload.openAIConfigured, false);
    } finally {
        await cleanup();
    }
});

test('auth register and login return a JWT-backed session', { concurrency: false }, async () => {
    const { baseUrl, cleanup, usersFile } = await makeServer();

    try {
        const { response, payload } = await registerUser(baseUrl);
        assert.equal(response.status, 201);
        assert.equal(payload.success, true);
        assert.ok(payload.token);
        assert.equal(payload.user.email, 'soumya@example.com');

        const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'soumya@example.com',
                password: 'super-secret-password',
            }),
        });

        const loginPayload = await loginResponse.json();
        assert.equal(loginResponse.status, 200);
        assert.ok(loginPayload.token);

        const storedUsers = await readFile(usersFile, 'utf8');
        assert.match(storedUsers, /soumya@example.com/);
        assert.doesNotMatch(storedUsers, /super-secret-password/);
    } finally {
        await cleanup();
    }
});

test('authenticated user can save private work and publish it later', { concurrency: false }, async () => {
    const { baseUrl, cleanup, postsFile } = await makeServer();

    try {
        const { payload } = await registerUser(baseUrl);
        const authHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.token}`,
        };

        const createResponse = await fetch(`${baseUrl}/api/v1/post`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                prompt: 'A cinematic monsoon skyline',
                photo: 'data:image/svg+xml;base64,PHN2Zy8+',
                isCommunity: false,
            }),
        });

        const created = await createResponse.json();
        assert.equal(createResponse.status, 201);
        assert.equal(created.data.ownerName, 'Soumya');
        assert.equal(created.data.isCommunity, false);

        const mineResponse = await fetch(`${baseUrl}/api/v1/post/mine`, {
            headers: {
                Authorization: `Bearer ${payload.token}`,
            },
        });
        const minePayload = await mineResponse.json();
        assert.equal(mineResponse.status, 200);
        assert.equal(minePayload.data.length, 1);

        const communityBeforeResponse = await fetch(`${baseUrl}/api/v1/post`);
        const communityBefore = await communityBeforeResponse.json();
        assert.equal(communityBefore.data.length, 0);

        const publishResponse = await fetch(`${baseUrl}/api/v1/post/${created.data._id}/community`, {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify({ isCommunity: true }),
        });
        const published = await publishResponse.json();
        assert.equal(publishResponse.status, 200);
        assert.equal(published.data.isCommunity, true);

        const communityAfterResponse = await fetch(`${baseUrl}/api/v1/post`);
        const communityAfter = await communityAfterResponse.json();
        assert.equal(communityAfterResponse.status, 200);
        assert.equal(communityAfter.data.length, 1);

        const storedFile = await readFile(postsFile, 'utf8');
        assert.match(storedFile, /A cinematic monsoon skyline/);
        assert.match(storedFile, /"isCommunity": true/);
    } finally {
        await cleanup();
    }
});

test('oversized payloads are rejected with 413', { concurrency: false }, async () => {
    const { baseUrl, cleanup } = await makeServer();

    try {
        const { payload } = await registerUser(baseUrl, {
            email: 'oversized@example.com',
        });

        const response = await fetch(`${baseUrl}/api/v1/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${payload.token}`,
            },
            body: JSON.stringify({
                prompt: 'Too large',
                photo: `data:image/png;base64,${'A'.repeat(8 * 1024 * 1024)}`,
                isCommunity: true,
            }),
        });

        const responsePayload = await response.json();
        assert.equal(response.status, 413);
        assert.match(responsePayload.message, /too large/i);
    } finally {
        await cleanup();
    }
});
