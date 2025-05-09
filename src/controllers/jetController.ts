import { Request, Response } from 'express';
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
    const { name, type, location } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    
    const newJet = new Jet({
      name,
      type,
      location,
      owner: req.user.id // Set the authenticated user as the owner
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
    const { name, type, location } = req.body;
    
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