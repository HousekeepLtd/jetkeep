import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';

// Wrapper for async route handlers to avoid try/catch in each controller
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'jetkeep-secret-key';

// Middleware to authenticate JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Find user with matching id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Middleware to authenticate API key
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from header or query
    const apiKey = req.header('X-API-Key') || req.query.api_key as string;
    
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
  } catch (error) {
    console.error('API key auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to check admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin privileges required' });
  }
  
  next();
};