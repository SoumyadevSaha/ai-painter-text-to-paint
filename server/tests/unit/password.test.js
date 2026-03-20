import test from 'node:test';
import assert from 'node:assert/strict';

import { hashPassword, verifyPassword } from '../../utils/password.js';

test('hashPassword returns a salted hash string', () => {
    const passwordHash = hashPassword('super-secret');

    assert.match(passwordHash, /^[a-f0-9]+:[a-f0-9]+$/);
});

test('verifyPassword returns true for the correct password', () => {
    const passwordHash = hashPassword('super-secret');

    assert.equal(verifyPassword('super-secret', passwordHash), true);
});

test('verifyPassword returns false for the wrong password', () => {
    const passwordHash = hashPassword('super-secret');

    assert.equal(verifyPassword('not-the-same', passwordHash), false);
});
