import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Jet from '../db/models/Jet.js';

// Get all jets (admin sees all, regular user sees only their own)
export const getJets = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    const isAdmin = req.user.role === 'admin';
    
    // Build query based on user role
    const query = isAdmin ? {} : { owner: req.user.id };
    
    const jets = await Jet.find(query).sort({ createdAt: -1 });
    res.status(200).json(jets);
  } catch (error) {
    console.error('Error fetching jets:', error);
    res.status(500).json({ message: 'Failed to fetch jets' });
  }
};

// Get a single jet by ID (owner or admin can view)
export const getJetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const jet = await Jet.findById(req.params.id);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Check if user is admin or the owner of the jet
    const isAdmin = req.user.role === 'admin';
    const isOwner = jet.owner.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Access denied. You do not own this jet.' });
      return;
    }
    
    res.status(200).json(jet);
  } catch (error) {
    console.error('Error fetching jet:', error);
    res.status(500).json({ message: 'Failed to fetch jet' });
  }
};

// Create a new jet (assigns current user as owner)
export const createJet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      type, 
      location,
      passengers,
      range,
      cruiseSpeed,
      hourlyRate,
      dailyRate,
      weeklyRate,
      availability,
      availabilityNotes,
      description,
      amenities,
      images
    } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    
    const newJet = new Jet({
      name,
      type,
      location,
      owner: req.user.id, // Set the authenticated user as the owner
      passengers,
      range,
      cruiseSpeed,
      hourlyRate,
      dailyRate,
      weeklyRate,
      availability: availability !== undefined ? availability : true,
      availabilityNotes,
      description,
      amenities,
      images
    });
    
    const savedJet = await newJet.save();
    res.status(201).json(savedJet);
  } catch (error) {
    console.error('Error creating jet:', error);
    res.status(500).json({ message: 'Failed to create jet' });
  }
};

// Update a jet (owner or admin can update)
export const updateJet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      type, 
      location,
      passengers,
      range,
      cruiseSpeed,
      hourlyRate,
      dailyRate,
      weeklyRate,
      availability,
      availabilityNotes,
      description,
      amenities,
      images
    } = req.body;
    
    // First, check if jet exists and if user has permission to update it
    const jet = await Jet.findById(req.params.id);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Check if user is admin or the owner of the jet
    const isAdmin = req.user.role === 'admin';
    const isOwner = jet.owner.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Access denied. You do not own this jet.' });
      return;
    }
    
    // Proceed with update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (location !== undefined) updateData.location = location;
    
    // Add booking-related fields
    if (passengers !== undefined) updateData.passengers = passengers;
    if (range !== undefined) updateData.range = range;
    if (cruiseSpeed !== undefined) updateData.cruiseSpeed = cruiseSpeed;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (dailyRate !== undefined) updateData.dailyRate = dailyRate;
    if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate;
    if (availability !== undefined) updateData.availability = availability;
    if (availabilityNotes !== undefined) updateData.availabilityNotes = availabilityNotes;
    if (description !== undefined) updateData.description = description;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (images !== undefined) updateData.images = images;
    
    const updatedJet = await Jet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedJet);
  } catch (error) {
    console.error('Error updating jet:', error);
    res.status(500).json({ message: 'Failed to update jet' });
  }
};

// Delete a jet (owner or admin can delete)
export const deleteJet = async (req: Request, res: Response): Promise<void> => {
  try {
    // First, check if jet exists and if user has permission to delete it
    const jet = await Jet.findById(req.params.id);
    
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    // Check if user is admin or the owner of the jet
    const isAdmin = req.user.role === 'admin';
    const isOwner = jet.owner.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Access denied. You do not own this jet.' });
      return;
    }
    
    // Proceed with deletion
    await Jet.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Jet deleted successfully' });
  } catch (error) {
    console.error('Error deleting jet:', error);
    res.status(500).json({ message: 'Failed to delete jet' });
  }
};

// Get available jets for booking
export const getAvailableJets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, minPassengers, maxPrice } = req.query;
    
    // Validate dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    
    if (startDate && endDate) {
      parsedStartDate = new Date(startDate as string);
      parsedEndDate = new Date(endDate as string);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
      
      if (parsedStartDate >= parsedEndDate) {
        res.status(400).json({ message: 'End date must be after start date' });
        return;
      }
    }
    
    // Base query - only show jets that are available for booking
    const query: any = { availability: true };
    
    // Add passenger filter if provided
    if (minPassengers) {
      query.passengers = { $gte: Number(minPassengers) };
    }
    
    // Add price filter if provided
    if (maxPrice) {
      // We'll filter by hourly rate since it's the most granular
      query.hourlyRate = { $lte: Number(maxPrice) };
    }
    
    // First get all jets that match the basic criteria
    const jets = await Jet.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    
    // If date range was provided, we need to filter out jets with overlapping bookings
    if (parsedStartDate && parsedEndDate) {
      const Booking = mongoose.model('Booking');
      
      // Filter jets that have no overlapping bookings
      const availableJets: any[] = [];
      
      for (const jet of jets) {
        const overlappingBookings = await Booking.countDocuments({
          jet: jet._id,
          currentStatus: { $in: ['pending', 'confirmed'] },
          $or: [
            { startDate: { $lt: parsedEndDate }, endDate: { $gt: parsedStartDate } },
            { startDate: { $gte: parsedStartDate, $lt: parsedEndDate } },
            { endDate: { $gt: parsedStartDate, $lte: parsedEndDate } }
          ]
        });
        
        if (overlappingBookings === 0) {
          availableJets.push(jet);
        }
      }
      
      res.status(200).json(availableJets);
    } else {
      // If no date range, just return all jets matching the criteria
      res.status(200).json(jets);
    }
  } catch (error) {
    console.error('Error fetching available jets:', error);
    res.status(500).json({ message: 'Failed to fetch available jets' });
  }
};