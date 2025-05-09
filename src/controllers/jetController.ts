import { Request, Response } from 'express';
import Jet from '../db/models/Jet.js';

// Get all jets
export const getJets = async (req: Request, res: Response): Promise<void> => {
  try {
    const jets = await Jet.find().sort({ createdAt: -1 });
    res.status(200).json(jets);
  } catch (error) {
    console.error('Error fetching jets:', error);
    res.status(500).json({ message: 'Failed to fetch jets' });
  }
};

// Get a single jet by ID
export const getJetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const jet = await Jet.findById(req.params.id);
    if (!jet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    res.status(200).json(jet);
  } catch (error) {
    console.error('Error fetching jet:', error);
    res.status(500).json({ message: 'Failed to fetch jet' });
  }
};

// Create a new jet
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
      location
    });
    
    const savedJet = await newJet.save();
    res.status(201).json(savedJet);
  } catch (error) {
    console.error('Error creating jet:', error);
    res.status(500).json({ message: 'Failed to create jet' });
  }
};

// Update a jet
export const updateJet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, location } = req.body;
    
    const updatedJet = await Jet.findByIdAndUpdate(
      req.params.id,
      { name, type, location },
      { new: true, runValidators: true }
    );
    
    if (!updatedJet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    res.status(200).json(updatedJet);
  } catch (error) {
    console.error('Error updating jet:', error);
    res.status(500).json({ message: 'Failed to update jet' });
  }
};

// Delete a jet
export const deleteJet = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedJet = await Jet.findByIdAndDelete(req.params.id);
    
    if (!deletedJet) {
      res.status(404).json({ message: 'Jet not found' });
      return;
    }
    
    res.status(200).json({ message: 'Jet deleted successfully' });
  } catch (error) {
    console.error('Error deleting jet:', error);
    res.status(500).json({ message: 'Failed to delete jet' });
  }
};