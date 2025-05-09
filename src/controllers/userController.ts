import { Request, Response } from 'express';
import User from '../db/models/User.js';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Make sure only admins can list users
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get a single user by ID (admin or own account)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only allow admins to view other users, or users to view themselves
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Make sure only admins can create users
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required' });
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
      password,
      role: role || 'user'
    });
    
    const savedUser = await user.save();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Update a user (admin or own account)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only allow admins to update other users, or users to update themselves
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const { username, email, password, role } = req.body;
    
    // Prepare update object
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    // Only admins can change roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    // Find user and update
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      (user as any)[key] = updateData[key];
    });
    
    // Save user
    const updatedUser = await user.save();
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Make sure only admins can delete users
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};