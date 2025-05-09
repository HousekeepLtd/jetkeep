import express from 'express';
import { asyncHandler } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate as any);

// Get all users (admin only)
router.get('/', asyncHandler(userController.getUsers) as any);

// Get a single user by ID
router.get('/:id', asyncHandler(userController.getUserById) as any);

// Create a new user (admin only)
router.post('/', asyncHandler(userController.createUser) as any);

// Update a user
router.put('/:id', asyncHandler(userController.updateUser) as any);

// Delete a user (admin only)
router.delete('/:id', asyncHandler(userController.deleteUser) as any);

export default router;