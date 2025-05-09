import { Request, Response } from 'express';
import jwt, {SignOptions} from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../db/models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jetkeep-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      res.status(400).json({ message: 'User with that email or username already exists' });
      return;
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Create and send token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Create and send token
    const token = generateToken(user.id);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is added to request by auth middleware
    const user = req.user;
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      hasApiKey: !!user.apiKey
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Generate API key for user
export const generateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    // Generate random API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Update user with new API key
    await User.findByIdAndUpdate(user.id, { apiKey });
    
    res.status(200).json({
      message: 'API key generated successfully',
      apiKey
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ message: 'Failed to generate API key' });
  }
};

// Revoke API key
export const revokeApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    // Remove API key from user
    await User.findByIdAndUpdate(user.id, { $unset: { apiKey: 1 } });
    
    res.status(200).json({
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ message: 'Failed to revoke API key' });
  }
};

// Helper function to generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY } as SignOptions);
};
