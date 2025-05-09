import { Request, Response } from 'express';
import * as mcpFunctions from './mcpFunctions.js';
import { McpFunctionCall, McpResponse } from './mcpServer.js';

// Map function names to their implementations
const functionMap: Record<string, Function> = {
  'list_jets': mcpFunctions.listJets,
  'get_jet': mcpFunctions.getJet,
  'create_jet': mcpFunctions.createJet,
  'update_jet': mcpFunctions.updateJet,
  'delete_jet': mcpFunctions.deleteJet
};

// Handle MCP function execution
export const handleMcpFunctionCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parameters } = req.body;
    
    if (!name || !functionMap[name]) {
      res.status(400).json({
        status: 'error',
        message: `Function "${name}" not found`
      });
      return;
    }
    
    // Add user information to the parameters
    const paramsWithUser = {
      ...parameters || {},
      userId: req.user.id,
      isAdmin: req.user.role === 'admin'
    };
    
    const functionToCall = functionMap[name];
    const result = await functionToCall(paramsWithUser);
    
    res.status(result.status === 'success' ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error executing MCP function:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute function'
    });
  }
};

// Process MCP function calls and format response
export const processFunctionCalls = async (functionCalls: McpFunctionCall[], req?: Request): Promise<McpResponse> => {
  try {
    // Handle only the first function call for simplicity
    // A more advanced implementation would handle multiple calls
    const functionCall = functionCalls[0];
    
    if (!functionCall || !functionMap[functionCall.name]) {
      return {
        content: `Function "${functionCall?.name}" not found or is not supported.`
      };
    }
    
    const { name, parameters } = functionCall;
    const functionToCall = functionMap[name];
    
    // Add user information to the parameters if request object is available
    const paramsWithUser = req ? {
      ...parameters || {},
      userId: req.user.id,
      isAdmin: req.user.role === 'admin'
    } : parameters || {};
    
    const result = await functionToCall(paramsWithUser);
    
    if (result.status === 'error') {
      return { 
        content: result.message 
      };
    }
    
    // Format response based on function
    switch (name) {
      case 'list_jets':
        if (!result.data || result.data.length === 0) {
          return { content: 'No jets found.' };
        }
        
        return {
          content: formatJetsList(result.data)
        };
        
      case 'get_jet':
        return {
          content: formatJetDetails(result.data)
        };
        
      case 'create_jet':
        return {
          content: `Successfully created jet "${result.data.name}" with ID ${result.data._id}.`
        };
        
      case 'update_jet':
        return {
          content: `Successfully updated jet "${result.data.name}".`
        };
        
      case 'delete_jet':
        return {
          content: result.message
        };
        
      default:
        return {
          content: 'Operation completed successfully.'
        };
    }
  } catch (error) {
    console.error('Error processing function calls:', error);
    return {
      content: 'An error occurred while processing your request.'
    };
  }
};

// Format a list of jets for response
function formatJetsList(jets: any[]): string {
  if (!jets || jets.length === 0) {
    return 'No jets found.';
  }
  
  return `Found ${jets.length} jets:\n\n` + 
    jets.map((jet, index) => {
      return `${index + 1}. ${jet.name} (ID: ${jet._id})` + 
        (jet.type ? `\n   Type: ${jet.type}` : '') +
        (jet.location ? `\n   Location: ${jet.location}` : '') +
        `\n   Created: ${new Date(jet.createdAt).toLocaleDateString()}`;
    }).join('\n\n');
}

// Format jet details for response
function formatJetDetails(jet: any): string {
  if (!jet) {
    return 'Jet not found.';
  }
  
  return `Jet Details:\n` +
    `Name: ${jet.name}\n` +
    `ID: ${jet._id}\n` +
    (jet.type ? `Type: ${jet.type}\n` : '') +
    (jet.location ? `Location: ${jet.location}\n` : '') +
    `Created: ${new Date(jet.createdAt).toLocaleString()}`;
}