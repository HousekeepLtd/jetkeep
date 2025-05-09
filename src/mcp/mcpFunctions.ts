import { Request, Response } from 'express';
import Jet from '../db/models/Jet.js';

// Interface for MCP function parameters
interface McpFunctionParams extends Record<string, any> {
  id?: string;
  name?: string;
  type?: string;
  location?: string;
  userId?: string; // Current user's ID
  isAdmin?: boolean; // Whether the current user is an admin
}

// Interface for MCP function response
interface McpFunctionResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

// Get all jets (respecting ownership)
export const listJets = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { userId, isAdmin } = params;
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required'
      };
    }
    
    // Build query based on user role
    const query = isAdmin ? {} : { owner: userId };
    
    const jets = await Jet.find(query).sort({ createdAt: -1 });
    return {
      status: 'success',
      data: jets
    };
  } catch (error) {
    console.error('Error fetching jets:', error);
    return {
      status: 'error',
      message: 'Failed to fetch jets'
    };
  }
};

// Get a single jet by ID (respecting ownership)
export const getJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { id, userId, isAdmin } = params;
    
    if (!id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
      };
    }
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required'
      };
    }

    const jet = await Jet.findById(id);
    if (!jet) {
      return {
        status: 'error',
        message: 'Jet not found'
      };
    }
    
    // Check if user is admin or the owner of the jet
    const isOwner = jet.owner.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      return {
        status: 'error',
        message: 'Access denied. You do not own this jet.'
      };
    }

    return {
      status: 'success',
      data: jet
    };
  } catch (error) {
    console.error('Error fetching jet:', error);
    return {
      status: 'error',
      message: 'Failed to fetch jet'
    };
  }
};

// Create a new jet (with owner)
export const createJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { name, type, location, userId } = params;
    
    if (!name) {
      return {
        status: 'error',
        message: 'Name is required'
      };
    }
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required'
      };
    }
    
    const newJet = new Jet({
      name,
      type,
      location,
      owner: userId
    });
    
    const savedJet = await newJet.save();
    return {
      status: 'success',
      data: savedJet,
      message: 'Jet created successfully'
    };
  } catch (error) {
    console.error('Error creating jet:', error);
    return {
      status: 'error',
      message: 'Failed to create jet'
    };
  }
};

// Update a jet (respecting ownership)
export const updateJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { id, name, type, location, userId, isAdmin } = params;
    
    if (!id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
      };
    }
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required'
      };
    }
    
    // First check if jet exists
    const jet = await Jet.findById(id);
    
    if (!jet) {
      return {
        status: 'error',
        message: 'Jet not found'
      };
    }
    
    // Check if user is admin or the owner of the jet
    const isOwner = jet.owner.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      return {
        status: 'error',
        message: 'Access denied. You do not own this jet.'
      };
    }

    // Only update fields that are provided
    const updateFields: Record<string, any> = {};
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) updateFields.type = type;
    if (location !== undefined) updateFields.location = location;
    
    const updatedJet = await Jet.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    return {
      status: 'success',
      data: updatedJet,
      message: 'Jet updated successfully'
    };
  } catch (error) {
    console.error('Error updating jet:', error);
    return {
      status: 'error',
      message: 'Failed to update jet'
    };
  }
};

// Delete a jet (respecting ownership)
export const deleteJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { id, userId, isAdmin } = params;
    
    if (!id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
      };
    }
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required'
      };
    }
    
    // First check if jet exists
    const jet = await Jet.findById(id);
    
    if (!jet) {
      return {
        status: 'error',
        message: 'Jet not found'
      };
    }
    
    // Check if user is admin or the owner of the jet
    const isOwner = jet.owner.toString() === userId;
    
    if (!isAdmin && !isOwner) {
      return {
        status: 'error',
        message: 'Access denied. You do not own this jet.'
      };
    }
    
    await Jet.findByIdAndDelete(id);
    
    return {
      status: 'success',
      message: 'Jet deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting jet:', error);
    return {
      status: 'error',
      message: 'Failed to delete jet'
    };
  }
};