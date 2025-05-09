import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate, authenticateApiKey } from '../middleware/auth.js';

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

// Get all bookings (filtered by user role)
router.get('/', bookingController.getBookings);

// Get a single booking
router.get('/:id', bookingController.getBookingById);

// Create a new booking
router.post('/', bookingController.createBooking);

// Update booking status
router.patch('/:id/status', bookingController.updateBookingStatus);

// Update booking details
router.put('/:id', bookingController.updateBooking);

// Delete a booking
router.delete('/:id', bookingController.deleteBooking);

// Check jet availability
router.post('/availability', bookingController.checkAvailability);

// Get price quote
router.post('/quote', bookingController.getPriceQuote);

export default router;