import User from '../mongodb/models/user.js';
import { isMongoReady } from '../mongodb/connect.js';
import { findLocalUserById } from '../storage/localUsersStore.js';
import { verifyAuthToken } from '../utils/jwt.js';

const requireAuth = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization || '';
        const [, token] = authorizationHeader.split(' ');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const payload = verifyAuthToken(token);
        const user = isMongoReady()
            ? await User.findById(payload.sub)
            : await findLocalUserById(payload.sub);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.user = {
            _id: user._id?.toString?.() || user._id,
            name: user.name,
            email: user.email,
        };

        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export { requireAuth };
