import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { z } from 'zod';
import { connectDB } from '../db/connection.js';
import Jet from '../db/models/Jet.js';
import User from '../db/models/User.js';

// Connect to MongoDB
connectDB();

// Create MCP Server
export const createMcpServer = async (port = 3001) => {
  const app = express();
  app.use(express.json());
  
  // Create the MCP server
  const server = new McpServer({
    name: "jetkeep",
    version: "1.0.0",
    description: "A tool for managing and keeping track of your jets",
  });
  
  // API key authentication middleware
  const authenticate = async (apiKey?: string) => {
    if (!apiKey) {
      throw new Error("Authentication required. Please provide an API key.");
    }
    
    // Find user with matching API key
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      throw new Error("Invalid API key.");
    }
    
    return {
      userId: user.id,
      isAdmin: user.role === 'admin'
    };
  };
  
  // Define MCP tools
  
  // List Jets Tool
  server.tool(
    "list_jets", 
    // No parameters required
    z.object({}).optional(),
    // Handler function
    async (_params, context) => {
      try {
        // Extract API key from context
        const apiKey = context.get("x-api-key");
        const user = await authenticate(apiKey);
        
        // Build query based on user role
        const query = user.isAdmin ? {} : { owner: user.userId };
        
        // Fetch jets
        const jets = await Jet.find(query).sort({ createdAt: -1 });
        
        // Format response
        if (jets.length === 0) {
          return { content: [{ type: "text", text: "No jets found." }] };
        }
        
        const jetsList = jets.map(jet => {
          return `${jet.name} (ID: ${jet._id})` +
            (jet.type ? `\nType: ${jet.type}` : '') + 
            (jet.location ? `\nLocation: ${jet.location}` : '') +
            `\nCreated: ${new Date(jet.createdAt).toLocaleDateString()}`;
        }).join("\n\n");
        
        return {
          content: [{ 
            type: "text", 
            text: `Found ${jets.length} jets:\n\n${jetsList}`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
          }]
        };
      }
    }
  );
  
  // Get Jet Tool
  server.tool(
    "get_jet",
    // Required id parameter
    z.object({
      id: z.string().describe("The ID of the jet to retrieve")
    }),
    // Handler function
    async (params, context) => {
      try {
        // Extract API key from context
        const apiKey = context.get("x-api-key");
        const user = await authenticate(apiKey);
        
        // Fetch jet
        const jet = await Jet.findById(params.id);
        
        if (!jet) {
          return { content: [{ type: "text", text: "Jet not found." }] };
        }
        
        // Check if user is admin or the owner
        const isOwner = jet.owner.toString() === user.userId;
        if (!user.isAdmin && !isOwner) {
          return { content: [{ type: "text", text: "Access denied. You do not own this jet." }] };
        }
        
        // Format response
        return {
          content: [{ 
            type: "text", 
            text: `Jet Details:\nName: ${jet.name}\nID: ${jet._id}\n` +
              (jet.type ? `Type: ${jet.type}\n` : '') +
              (jet.location ? `Location: ${jet.location}\n` : '') +
              `Created: ${new Date(jet.createdAt).toLocaleString()}`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
          }]
        };
      }
    }
  );
  
  // Create Jet Tool
  server.tool(
    "create_jet",
    // Parameters
    z.object({
      name: z.string().describe("The name of the jet (required)"),
      type: z.string().optional().describe("The type or model of the jet (optional)"),
      location: z.string().optional().describe("The current location of the jet (optional)")
    }),
    // Handler function
    async (params, context) => {
      try {
        // Extract API key from context
        const apiKey = context.get("x-api-key");
        const user = await authenticate(apiKey);
        
        // Create new jet
        const newJet = new Jet({
          name: params.name,
          type: params.type,
          location: params.location,
          owner: user.userId
        });
        
        // Save jet
        const savedJet = await newJet.save();
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully created jet "${savedJet.name}" with ID ${savedJet._id}.`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
          }]
        };
      }
    }
  );
  
  // Update Jet Tool
  server.tool(
    "update_jet",
    // Parameters
    z.object({
      id: z.string().describe("The ID of the jet to update"),
      name: z.string().optional().describe("The new name for the jet (optional)"),
      type: z.string().optional().describe("The new type or model for the jet (optional)"),
      location: z.string().optional().describe("The new location for the jet (optional)")
    }),
    // Handler function
    async (params, context) => {
      try {
        // Extract API key from context
        const apiKey = context.get("x-api-key");
        const user = await authenticate(apiKey);
        
        // First check if jet exists
        const jet = await Jet.findById(params.id);
        
        if (!jet) {
          return { content: [{ type: "text", text: "Jet not found." }] };
        }
        
        // Check if user is admin or the owner
        const isOwner = jet.owner.toString() === user.userId;
        if (!user.isAdmin && !isOwner) {
          return { content: [{ type: "text", text: "Access denied. You do not own this jet." }] };
        }
        
        // Only update fields that are provided
        const updateFields: Record<string, any> = {};
        if (params.name !== undefined) updateFields.name = params.name;
        if (params.type !== undefined) updateFields.type = params.type;
        if (params.location !== undefined) updateFields.location = params.location;
        
        // Update jet
        const updatedJet = await Jet.findByIdAndUpdate(
          params.id,
          updateFields,
          { new: true, runValidators: true }
        );
        
        return {
          content: [{ 
            type: "text", 
            text: `Successfully updated jet "${updatedJet?.name}".`
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
          }]
        };
      }
    }
  );
  
  // Delete Jet Tool
  server.tool(
    "delete_jet",
    // Parameters
    z.object({
      id: z.string().describe("The ID of the jet to delete")
    }),
    // Handler function
    async (params, context) => {
      try {
        // Extract API key from context
        const apiKey = context.get("x-api-key");
        const user = await authenticate(apiKey);
        
        // First check if jet exists
        const jet = await Jet.findById(params.id);
        
        if (!jet) {
          return { content: [{ type: "text", text: "Jet not found." }] };
        }
        
        // Check if user is admin or the owner
        const isOwner = jet.owner.toString() === user.userId;
        if (!user.isAdmin && !isOwner) {
          return { content: [{ type: "text", text: "Access denied. You do not own this jet." }] };
        }
        
        // Delete jet
        await Jet.findByIdAndDelete(params.id);
        
        return {
          content: [{ 
            type: "text", 
            text: "Jet deleted successfully." 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
          }]
        };
      }
    }
  );
  
  // Handle MCP requests
  app.post('/v1', async (req, res) => {
    try {
      console.log('Received MCP request:', JSON.stringify(req.body, null, 2));
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });
      
      res.on('close', () => {
        transport.close();
        server.close();
      });
      
      await server.connect(transport);
      
      try {
        await transport.handleRequest(req, res, req.body);
      } catch (transportError) {
        console.error('Transport error:', transportError);
        // Don't send a response here, as the transport might have already started sending a response
      }
    } catch (error) {
      console.error('MCP error:', error);
      // Only send an error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ 
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: 'Internal server error',
            data: error instanceof Error ? error.message : String(error)
          },
          id: req.body?.id || null
        });
      }
    }
  });
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Root route
  app.get('/', (req, res) => {
    res.send('JetKeep Official MCP API is running. Send POST requests to /v1');
  });
  
  // Debug endpoint
  app.post('/v1/debug', (req, res) => {
    console.log('Debug request:', JSON.stringify(req.body, null, 2));
    console.log('Debug headers:', JSON.stringify(req.headers, null, 2));
    
    // Echo back the request plus some additional info
    res.json({
      received: {
        body: req.body,
        headers: req.headers
      },
      serverInfo: {
        tools: Object.keys(server.tools).map(name => ({
          name,
          description: server.tools[name].description
        })),
        time: new Date().toISOString()
      }
    });
  });
  
  // Start the server
  const startServer = () => {
    app.listen(port, () => {
      console.log(`Official MCP Server running on port ${port}`);
    });
  };
  
  return {
    app,
    start: startServer
  };
};
