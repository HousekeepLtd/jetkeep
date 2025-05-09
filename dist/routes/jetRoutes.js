import express from 'express';
import * as jetController from '../controllers/jetController.js';
import { authenticate, authenticateApiKey } from '../middleware/auth.js';
const router = express.Router();
// Auth middleware for all routes
router.use((req, res, next) => {
    // Try both JWT and API key authentication
    authenticate(req, res, (err) => {
        if (err || !req.user) {
            // If JWT auth fails, try API key
            authenticateApiKey(req, res, next);
        }
        else {
            next();
        }
    });
});
// Get available jets for booking (customers can see)
router.get('/available', jetController.getAvailableJets);
// Get all jets (users see their own, admins see all)
router.get('/', jetController.getJets);
// Get a single jet by ID (only owner or admin can view)
router.get('/:id', jetController.getJetById);
// Create a new jet (user becomes owner)
router.post('/', jetController.createJet);
// Update a jet (only owner or admin can update)
router.put('/:id', jetController.updateJet);
// Delete a jet (only owner or admin can delete)
router.delete('/:id', jetController.deleteJet);
export default router;
//# sourceMappingURL=jetRoutes.js.map