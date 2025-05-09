import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, asyncHandler } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(authController.register) as any);
router.post('/login', asyncHandler(authController.login) as any);

// Protected routes
// @ts-ignore
router.get('/profile', authenticate, asyncHandler(authController.getProfile));
// @ts-ignore
router.post('/api-key', authenticate, asyncHandler(authController.generateApiKey));
// @ts-ignore
router.delete('/api-key', authenticate, asyncHandler(authController.revokeApiKey));

export default router;