import express from 'express';
import * as jetController from '../controllers/jetController.js';
import { authenticate, authenticateApiKey, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Auth middleware for all routes
router.use((req, res, next) => {
  // Try both JWT and API key authentication
  authenticate(req, res, (err: any) => {
    if (err || !req.user) {
      // If JWT auth fails, try API key
      authenticateApiKey(req, res, next);
    } else {
      next();
    }
  });
});

// Get all jets - available to all authenticated users
router.get('/', jetController.getJets);

// Get a single jet by ID - available to all authenticated users
router.get('/:id', jetController.getJetById);

// Create a new jet - available to all authenticated users
router.post('/', jetController.createJet);

// Update a jet - available to all authenticated users
router.put('/:id', jetController.updateJet);

// Delete a jet - only admins can delete
router.delete('/:id', isAdmin, jetController.deleteJet);

export default router;