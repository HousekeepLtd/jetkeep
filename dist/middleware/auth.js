import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';
// Wrapper for async route handlers to avoid try/catch in each controller
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const JWT_SECRET = process.env.JWT_SECRET || 'jetkeep-secret-key';
// Middleware to authenticate JWT token
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Find user with matching id
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};
// Middleware to authenticate API key
export const authenticateApiKey = async (req, res, next) => {
    try {
        // Get API key from header or query
        const apiKey = req.header('X-API-Key') || req.query.api_key;
        if (!apiKey) {
            return res.status(401).json({ message: 'No API key provided, access denied' });
        }
        // Find user with matching API key
        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(401).json({ message: 'Invalid API key' });
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('API key auth error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};
// Middleware to check admin role
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    next();
};
//# sourceMappingURL=auth.js.map