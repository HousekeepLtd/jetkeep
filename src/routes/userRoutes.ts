import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', userController.getUsers);

// Get a single user by ID
router.get('/:id', userController.getUserById);

// Create a new user (admin only)
router.post('/', userController.createUser);

// Update a user
router.put('/:id', userController.updateUser);

// Delete a user (admin only)
router.delete('/:id', userController.deleteUser);

export default router;