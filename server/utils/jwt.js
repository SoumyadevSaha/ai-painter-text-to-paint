import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-only-jwt-secret';

const signAuthToken = (user) => jwt.sign(
    {
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
);

const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());

const sanitizeUser = (user) => ({
    _id: user._id?.toString?.() || user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export { getJwtSecret, sanitizeUser, signAuthToken, verifyAuthToken };
