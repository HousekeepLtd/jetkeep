import express from 'express';
import { asyncHandler } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// All routes require authentication
router.use(authenticate);
// Get all users (admin only)
router.get('/', asyncHandler(userController.getUsers));
// Get a single user by ID
router.get('/:id', asyncHandler(userController.getUserById));
// Create a new user (admin only)
router.post('/', asyncHandler(userController.createUser));
// Update a user
router.put('/:id', asyncHandler(userController.updateUser));
// Delete a user (admin only)
router.delete('/:id', asyncHandler(userController.deleteUser));
export default router;
//# sourceMappingURL=userRoutes.js.map