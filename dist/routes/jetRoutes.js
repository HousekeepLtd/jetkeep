import express from 'express';
import * as jetController from '../controllers/jetController.js';
const router = express.Router();
// Get all jets
router.get('/', jetController.getJets);
// Get a single jet by ID
router.get('/:id', jetController.getJetById);
// Create a new jet
router.post('/', jetController.createJet);
// Update a jet
router.put('/:id', jetController.updateJet);
// Delete a jet
router.delete('/:id', jetController.deleteJet);
export default router;
//# sourceMappingURL=jetRoutes.js.map