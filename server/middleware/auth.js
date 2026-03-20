import User from '../mongodb/models/user.js';
import { isMongoReady } from '../mongodb/connect.js';
import { findLocalUserById } from '../storage/localUsersStore.js';
import { verifyAuthToken } from '../utils/jwt.js';

const getBearerToken = (req) => {
    const authorizationHeader = req.headers.authorization || '';
    const [, token] = authorizationHeader.split(' ');
    return token || null;
};

const resolveRequestUser = async (req) => {
    const token = getBearerToken(req);

    if (!token) {
        return null;
    }

    const payload = verifyAuthToken(token);
    const user = isMongoReady()
        ? await User.findById(payload.sub)
        : await findLocalUserById(payload.sub);

    if (!user) {
        throw new Error('Invalid token');
    }

    return {
        _id: user._id?.toString?.() || user._id,
        name: user.name,
        email: user.email,
    };
};

const requireAuth = async (req, res, next) => {
    try {
        const user = await resolveRequestUser(req);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        req.user = await resolveRequestUser(req);
    } catch {
        req.user = null;
    }

    next();
};

export { optionalAuth, requireAuth };
