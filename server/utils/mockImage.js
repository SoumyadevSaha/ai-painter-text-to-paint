const escapeXml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;');

const createSeed = (prompt) => [...prompt].reduce(
    (total, char, index) => total + char.charCodeAt(0) * (index + 1),
    0
);

const createMockImageDataUrl = (prompt) => {
    const safePrompt = prompt.trim() || 'Untitled artwork';
    const seed = createSeed(safePrompt);
    const hueOne = seed % 360;
    const hueTwo = (seed * 7) % 360;
    const shortPrompt = safePrompt.length > 90 ? `${safePrompt.slice(0, 87)}...` : safePrompt;

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
            <defs>
                <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stop-color="hsl(${hueOne}, 82%, 58%)" />
                    <stop offset="100%" stop-color="hsl(${hueTwo}, 78%, 44%)" />
                </linearGradient>
            </defs>
            <rect width="1024" height="1024" fill="url(#bg)" rx="36" />
            <circle cx="210" cy="200" r="140" fill="rgba(255,255,255,0.15)" />
            <circle cx="790" cy="800" r="180" fill="rgba(255,255,255,0.12)" />
            <rect x="92" y="92" width="840" height="840" rx="28" fill="rgba(10,16,30,0.24)" stroke="rgba(255,255,255,0.25)" />
            <text x="512" y="360" text-anchor="middle" fill="#ffffff" font-size="42" font-family="Arial, sans-serif" opacity="0.8">Local preview image</text>
            <foreignObject x="156" y="410" width="712" height="300">
                <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;height:100%;align-items:center;justify-content:center;text-align:center;color:white;font-family:Arial,sans-serif;font-size:52px;font-weight:700;line-height:1.2;padding:0 12px;">
                    ${escapeXml(shortPrompt)}
                </div>
            </foreignObject>
            <text x="512" y="820" text-anchor="middle" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" opacity="0.72">Set OPENAI_API_KEY to switch from mock mode to real image generation</text>
        </svg>
    `.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

export { createMockImageDataUrl };
