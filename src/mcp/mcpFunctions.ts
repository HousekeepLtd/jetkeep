import { Request, Response } from 'express';
import Jet from '../db/models/Jet.js';

// Interface for MCP function parameters
interface McpFunctionParams extends Record<string, any> {
  id?: string;
  name?: string;
  type?: string;
  location?: string;
}

// Interface for MCP function response
interface McpFunctionResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

// Get all jets
export const listJets = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const jets = await Jet.find().sort({ createdAt: -1 });
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

// Get a single jet by ID
export const getJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    if (!params.id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
      };
    }

    const jet = await Jet.findById(params.id);
    if (!jet) {
      return {
        status: 'error',
        message: 'Jet not found'
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

// Create a new jet
export const createJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { name, type, location } = params;
    
    if (!name) {
      return {
        status: 'error',
        message: 'Name is required'
      };
    }
    
    const newJet = new Jet({
      name,
      type,
      location
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

// Update a jet
export const updateJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { id, name, type, location } = params;
    
    if (!id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
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
    
    if (!updatedJet) {
      return {
        status: 'error',
        message: 'Jet not found'
      };
    }
    
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

// Delete a jet
export const deleteJet = async (params: McpFunctionParams): Promise<McpFunctionResponse> => {
  try {
    const { id } = params;
    
    if (!id) {
      return {
        status: 'error',
        message: 'Jet ID is required'
      };
    }

    const deletedJet = await Jet.findByIdAndDelete(id);
    
    if (!deletedJet) {
      return {
        status: 'error',
        message: 'Jet not found'
      };
    }
    
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