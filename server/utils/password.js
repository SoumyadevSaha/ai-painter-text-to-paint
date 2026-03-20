import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const hashPassword = (password) => {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
};

const verifyPassword = (password, passwordHash) => {
    const [salt, storedKey] = passwordHash.split(':');

    if (!salt || !storedKey) {
        return false;
    }

    const derivedKey = scryptSync(password, salt, 64);
    const storedBuffer = Buffer.from(storedKey, 'hex');

    if (storedBuffer.length !== derivedKey.length) {
        return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
};

export { hashPassword, verifyPassword };
