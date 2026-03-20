import test from 'node:test';
import assert from 'node:assert/strict';

import { createMockImageDataUrl } from '../../utils/mockImage.js';

test('createMockImageDataUrl returns a valid SVG data URL', () => {
    const dataUrl = createMockImageDataUrl('A lantern-lit alley in Kolkata');

    assert.match(dataUrl, /^data:image\/svg\+xml;base64,/);
});

test('createMockImageDataUrl is deterministic for the same prompt', () => {
    const first = createMockImageDataUrl('Dreamlike tiger palace');
    const second = createMockImageDataUrl('Dreamlike tiger palace');

    assert.equal(first, second);
});

test('createMockImageDataUrl safely handles special characters', () => {
    const dataUrl = createMockImageDataUrl('<storm & light>');
    const decoded = Buffer.from(dataUrl.split(',')[1], 'base64').toString('utf8');

    assert.match(decoded, /&lt;storm &amp; light&gt;/);
});
