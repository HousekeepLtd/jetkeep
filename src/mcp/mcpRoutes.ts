import express from 'express';
import { handleMcpFunctionCall, processFunctionCalls } from './mcpHandler.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Handle direct function calls (for external tools that know the function names)
router.post('/function', authenticateApiKey, handleMcpFunctionCall);

// Handle function calls within MCP format - this route requires authentication
router.post('/run', authenticateApiKey, async (req, res) => {
  try {
    const { function_calls } = req.body;
    
    if (!function_calls || !Array.isArray(function_calls) || function_calls.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request format. Expected function_calls array.'
      });
      return;
    }
    
    const response = await processFunctionCalls(function_calls);
    res.json(response);
  } catch (error) {
    console.error('Error processing function calls:', error);
    res.status(500).json({
      content: 'An error occurred while processing your request.'
    });
  }
});

export default router;