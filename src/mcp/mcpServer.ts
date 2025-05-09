import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import * as jetController from '../controllers/jetController.js';
import mcpRoutes from './mcpRoutes.js';
import { processFunctionCalls } from './mcpHandler.js';

// MCP Controller types
export interface McpFunctionCall {
  name: string;
  parameters: Record<string, any>;
}

export interface McpResponse {
  content?: string;
  function_calls?: McpFunctionCall[];
}

// Create MCP router
const createMcpRouter = (): Router => {
  const router = Router();

  // Handle incoming MCP requests
  router.post('/generate', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request format. Expected messages array.' });
      }

      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (!lastUserMessage || !lastUserMessage.content) {
        return res.status(400).json({ error: 'No user message found.' });
      }

      const userInput = lastUserMessage.content;
      
      // Parse user intent to determine which function to call
      const response = await handleUserIntent(userInput);
      
      // If we have function calls, process them
      if (response.function_calls && response.function_calls.length > 0) {
        const functionResult = await processFunctionCalls(response.function_calls, req);
        return res.json(functionResult);
      }
      
      res.json(response);
    } catch (error) {
      console.error('MCP error:', error);
      res.status(500).json({ 
        content: 'An error occurred processing your request.'
      });
    }
  });

  return router;
};

// Function to handle user intent and call appropriate function
async function handleUserIntent(userInput: string): Promise<McpResponse> {
  const inputLower = userInput.toLowerCase();
  
  // Simple intent matching based on keywords
  if (/list all( jets)?|show all( jets)?|get all( jets)?/.test(inputLower)) {
    return {
      function_calls: [{
        name: 'list_jets',
        parameters: {}
      }]
    };
  } else if (/get jet|find jet|fetch jet|show jet/.test(inputLower)) {
    // Extract ID from input (basic implementation)
    const idMatch = inputLower.match(/id[:\s]*(.*?)($|\s)/i) || 
                    inputLower.match(/(jet|id)[\s]+([a-f0-9]+)/i);
    
    const id = idMatch ? idMatch[1] || idMatch[2] : null;
    
    if (!id) {
      return { content: "Please provide a jet ID to look up." };
    }
    
    return {
      function_calls: [{
        name: 'get_jet',
        parameters: { id }
      }]
    };
  } else if (/add|create|new/.test(inputLower)) {
    // Extract jet details (basic implementation)
    const nameMatch = userInput.match(/name[:\s]*(.*?)($|\s|,)/i) || 
                      userInput.match(/\"(.*?)\"/);
    
    if (!nameMatch) {
      return { content: "Please provide a name for the jet." };
    }
    
    const name = nameMatch[1];
    const typeMatch = userInput.match(/type[:\s]*(.*?)($|\s|,)/i);
    const locMatch = userInput.match(/location[:\s]*(.*?)($|\s|,)/i);
    
    return {
      function_calls: [{
        name: 'create_jet',
        parameters: { 
          name,
          type: typeMatch ? typeMatch[1] : undefined,
          location: locMatch ? locMatch[1] : undefined
        }
      }]
    };
  } else if (/update|edit|modify|change/.test(inputLower)) {
    // Extract ID and details
    const idMatch = inputLower.match(/id[:\s]*(.*?)($|\s|,)/i) || 
                    inputLower.match(/(jet|id)[\s]+([a-f0-9]+)/i);
    
    if (!idMatch) {
      return { content: "Please provide a jet ID to update." };
    }
    
    const id = idMatch[1] || idMatch[2];
    const nameMatch = userInput.match(/name[:\s]*(.*?)($|\s|,)/i);
    const typeMatch = userInput.match(/type[:\s]*(.*?)($|\s|,)/i);
    const locMatch = userInput.match(/location[:\s]*(.*?)($|\s|,)/i);
    
    return {
      function_calls: [{
        name: 'update_jet',
        parameters: { 
          id,
          name: nameMatch ? nameMatch[1] : undefined,
          type: typeMatch ? typeMatch[1] : undefined,
          location: locMatch ? locMatch[1] : undefined
        }
      }]
    };
  } else if (/delete|remove/.test(inputLower)) {
    // Extract ID
    const idMatch = inputLower.match(/id[:\s]*(.*?)($|\s|,)/i) || 
                    inputLower.match(/(jet|id)[\s]+([a-f0-9]+)/i);
    
    if (!idMatch) {
      return { content: "Please provide a jet ID to delete." };
    }
    
    const id = idMatch[1] || idMatch[2];
    
    return {
      function_calls: [{
        name: 'delete_jet',
        parameters: { id }
      }]
    };
  } else {
    // Default response if no intent matched
    return {
      content: `I can help you manage your jets. You can ask me to:
- List all jets
- Get details for a specific jet by ID
- Create a new jet
- Update an existing jet
- Delete a jet

For example, try "List all jets" or "Create a new jet named Boeing 747".`
    };
  }
}

// Create and configure the MCP server
export const createMcpServer = (port = 3001) => {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // MCP Routes
  app.use('/v1', createMcpRouter());
  app.use('/mcp', mcpRoutes);
  
  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Root route
  app.get('/', (req, res) => {
    res.send('JetKeep MCP API is running. Send POST requests to /v1/generate');
  });
  
  // API schema for MCP
  app.get('/schema', (req, res) => {
    const schema = {
      schema_version: "v1",
      name: "jetkeep",
      description: "A tool for managing and keeping track of your jets",
      functions: [
        {
          name: "list_jets",
          description: "List all jets in the system (admin sees all, regular users see only their own)",
          parameters: {}
        },
        {
          name: "get_jet",
          description: "Get details of a specific jet by ID (only owner or admin can view)",
          parameters: {
            id: {
              type: "string",
              description: "The ID of the jet to retrieve"
            }
          }
        },
        {
          name: "create_jet",
          description: "Add a new jet to the system (user becomes the owner)",
          parameters: {
            name: {
              type: "string",
              description: "The name of the jet (required)"
            },
            type: {
              type: "string",
              description: "The type or model of the jet (optional)"
            },
            location: {
              type: "string",
              description: "The current location of the jet (optional)"
            }
          }
        },
        {
          name: "update_jet",
          description: "Update an existing jet's information (only owner or admin can update)",
          parameters: {
            id: {
              type: "string",
              description: "The ID of the jet to update"
            },
            name: {
              type: "string",
              description: "The new name for the jet (optional)"
            },
            type: {
              type: "string",
              description: "The new type or model for the jet (optional)"
            },
            location: {
              type: "string",
              description: "The new location for the jet (optional)"
            }
          }
        },
        {
          name: "delete_jet",
          description: "Delete a jet from the system (only owner or admin can delete)",
          parameters: {
            id: {
              type: "string",
              description: "The ID of the jet to delete"
            }
          }
        }
      ]
    };
    
    res.json(schema);
  });
  
  return {
    app,
    start: () => {
      app.listen(port, () => {
        console.log(`MCP Server running on port ${port}`);
        console.log(`MCP Schema available at http://localhost:${port}/schema`);
      });
    }
  };
};