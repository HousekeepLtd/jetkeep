import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../db/models/Booking.js';
import Jet from '../db/models/Jet.js';

// Get all bookings (admin sees all, user sees only their bookings)
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    // Build query based on user role
    interface BookingQuery {
      customer?: string;
      currentStatus?: string;
      jet?: { $in: mongoose.Types.ObjectId[] };
      $or?: Array<{ customer: string } | { jet: { $in: mongoose.Types.ObjectId[] } }>;
    }
    
    const query: BookingQuery = isAdmin ? {} : { customer: req.user.id };
    
    // Add status filter if provided
    if (req.query.status) {
      query.currentStatus = req.query.status as string;
    }
    
    // For jet owners, optionally show bookings for their jets
    if (req.query.showJetBookings === 'true') {
      const ownedJets = await Jet.find({ owner: req.user.id }).select('_id');
      const jetIds = ownedJets.map(jet => jet._id) as mongoose.Types.ObjectId[];
      
      if (jetIds.length > 0) {
        if (query.customer) {
          // Show both: bookings made by user and bookings for user's jets
          delete query.customer;
          query.$or = [
            { customer: req.user.id },
            { jet: { $in: jetIds } }
          ];
        } else {
          // Just filter by jets (for admin)
          query.jet = { $in: jetIds };
        }
      }
    }
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('jet', 'name type location hourlyRate')
      .populate('customer', 'username email');
      
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get a single booking
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('jet')
      .populate('customer', 'username email');
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    // Check if user is admin, the customer, or the jet owner
    const isAdmin = req.user.role === 'admin';
    const isCustomer = booking.customer._id.toString() === req.user.id;
    
    const jet = await Jet.findById(booking.jet);
    const isJetOwner = jet && jet.owner.toString() === req.user.id;
    
    if (!isAdmin && !isCustomer && !isJetOwner) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jet: jetId, startDate, endDate, passengers, destination } = req.body;
    
    if (!jetId || !startDate || !endDate) {
      res.status(400).json({ message: 'Jet ID, start date, and end date are required' });
      return;
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }
    
    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }
    
    if (parsedStartDate < new Date()) {
      res.status(400).json({ message: 'Start date cannot be in the past' });
      return;
    }
    
    // Find the jet
    const jet = await Jet.findById(jetId);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Check if jet is available
    const isAvailable = await jet.isAvailableForBooking(parsedStartDate, parsedEndDate);
    
    if (!isAvailable) {
      res.status(400).json({ message: 'Jet is not available for the selected dates' });
      return;
    }
    
    // Calculate price
    const totalPrice = jet.calculatePrice(parsedStartDate, parsedEndDate);
    
    // Create booking
    const booking = new Booking({
      jet: jetId,
      customer: req.user.id,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      totalPrice,
      passengers: passengers || 1,
      destination,
      statusHistory: [{
        status: 'pending',
        updatedAt: new Date(),
        notes: 'Booking created'
      }]
    });
    
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('jet', 'name type location hourlyRate')
      .populate('customer', 'username email');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({ message: 'Valid status is required' });
      return;
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('jet');
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    // Get the jet to check if user is the owner
    const jet = await Jet.findById(booking.jet);
    
    // Determine if user has permission to update status
    const isAdmin = req.user.role === 'admin';
    const isJetOwner = jet && jet.owner.toString() === req.user.id;
    const isCustomer = booking.customer.toString() === req.user.id;
    
    // Rules for status changes
    let allowed = false;
    
    if (isAdmin) {
      // Admin can change any status
      allowed = true;
    } else if (isJetOwner) {
      // Jet owner can confirm or cancel a pending booking, or mark as completed
      if (
        (booking.currentStatus === 'pending' && (status === 'confirmed' || status === 'cancelled')) ||
        (booking.currentStatus === 'confirmed' && status === 'completed')
      ) {
        allowed = true;
      }
    } else if (isCustomer) {
      // Customer can only cancel their own booking if it's pending or confirmed
      if ((booking.currentStatus === 'pending' || booking.currentStatus === 'confirmed') && status === 'cancelled') {
        allowed = true;
      }
    }
    
    if (!allowed) {
      res.status(403).json({ message: 'You do not have permission to update this booking status' });
      return;
    }
    
    // Update booking status
    booking.currentStatus = status;
    booking.statusHistory.push({
      status,
      updatedAt: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    await booking.save();
    
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('jet', 'name type location hourlyRate')
      .populate('customer', 'username email');
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

// Update booking details
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, passengers, destination } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    // Only allow updates to pending bookings
    if (booking.currentStatus !== 'pending') {
      res.status(400).json({ message: 'Can only update pending bookings' });
      return;
    }
    
    // Check if user is the customer or admin
    const isAdmin = req.user.role === 'admin';
    const isCustomer = booking.customer.toString() === req.user.id;
    
    if (!isAdmin && !isCustomer) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    // Parse dates if provided
    let parsedStartDate = booking.startDate;
    let parsedEndDate = booking.endDate;
    let updatePrice = false;
    
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        res.status(400).json({ message: 'Invalid start date format' });
        return;
      }
      updatePrice = true;
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ message: 'Invalid end date format' });
        return;
      }
      updatePrice = true;
    }
    
    // Validate dates
    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }
    
    if (parsedStartDate < new Date()) {
      res.status(400).json({ message: 'Start date cannot be in the past' });
      return;
    }
    
    // Check if jet is available for the new dates
    if (updatePrice) {
      const jet = await Jet.findById(booking.jet);
      
      if (!jet) {
        res.status(404).json({ message: 'Jet not found' });
        return;
      }
      
      // Check availability (excluding this booking)
      const overlappingBookings = await Booking.countDocuments({
        _id: { $ne: booking._id },
        jet: booking.jet,
        currentStatus: { $in: ['pending', 'confirmed'] },
        $or: [
          { startDate: { $lt: parsedEndDate }, endDate: { $gt: parsedStartDate } },
          { startDate: { $gte: parsedStartDate, $lt: parsedEndDate } },
          { endDate: { $gt: parsedStartDate, $lte: parsedEndDate } }
        ]
      });
      
      if (overlappingBookings > 0) {
        res.status(400).json({ message: 'Jet is not available for the selected dates' });
        return;
      }
      
      // Calculate new price
      const totalPrice = jet.calculatePrice(parsedStartDate, parsedEndDate);
      booking.totalPrice = totalPrice;
    }
    
    // Update booking fields
    if (startDate) booking.startDate = parsedStartDate;
    if (endDate) booking.endDate = parsedEndDate;
    if (passengers !== undefined) booking.passengers = passengers;
    if (destination !== undefined) booking.destination = destination;
    
    // Add status update entry
    booking.statusHistory.push({
      status: booking.currentStatus,
      updatedAt: new Date(),
      notes: 'Booking details updated'
    });
    
    await booking.save();
    
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('jet', 'name type location hourlyRate')
      .populate('customer', 'username email');
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// Delete a booking
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    
    // Only allow deleting of cancelled bookings
    if (booking.currentStatus !== 'cancelled') {
      res.status(400).json({ message: 'Only cancelled bookings can be deleted' });
      return;
    }
    
    // Only admin or the customer can delete a booking
    const isAdmin = req.user.role === 'admin';
    const isCustomer = booking.customer.toString() === req.user.id;
    
    if (!isAdmin && !isCustomer) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};

// Check jet availability
export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jetId, startDate, endDate } = req.body;
    
    if (!jetId || !startDate || !endDate) {
      res.status(400).json({ message: 'Jet ID, start date, and end date are required' });
      return;
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }
    
    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }
    
    // Find the jet
    const jet = await Jet.findById(jetId);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Check if jet is available
    const isAvailable = await jet.isAvailableForBooking(parsedStartDate, parsedEndDate);
    
    res.status(200).json({ 
      available: isAvailable,
      jet: {
        id: jet._id,
        name: jet.name,
        type: jet.type,
        location: jet.location
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Failed to check availability' });
  }
};

// Get price quote
export const getPriceQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jetId, startDate, endDate } = req.body;
    
    if (!jetId || !startDate || !endDate) {
      res.status(400).json({ message: 'Jet ID, start date, and end date are required' });
      return;
    }
    
    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validate dates
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }
    
    if (parsedStartDate >= parsedEndDate) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }
    
    // Find the jet
    const jet = await Jet.findById(jetId);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Calculate duration
    const durationMs = parsedEndDate.getTime() - parsedStartDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const durationDays = durationHours / 24;
    
    // Calculate price
    const totalPrice = jet.calculatePrice(parsedStartDate, parsedEndDate);
    
    res.status(200).json({
      hourlyRate: jet.hourlyRate,
      dailyRate: jet.dailyRate,
      weeklyRate: jet.weeklyRate,
      totalPrice,
      durationHours,
      durationDays,
      jetName: jet.name
    });
  } catch (error) {
    console.error('Error calculating price quote:', error);
    res.status(500).json({ message: 'Failed to calculate price quote' });
  }
};