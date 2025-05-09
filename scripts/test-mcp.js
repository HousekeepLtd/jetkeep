import fetch from 'node-fetch';

const MCP_URL = 'http://localhost:3001/v1/generate';

async function testMcp() {
  try {
    console.log('--- Testing JetKeep MCP API ---\n');
    
    // Test 1: Getting help
    console.log('Test 1: Getting help');
    const helpResponse = await callMcp('What can you do?');
    console.log('Response:', helpResponse);
    console.log();
    
    // Test 2: List all jets
    console.log('Test 2: List all jets');
    const listResponse = await callMcp('List all jets');
    console.log('Response:', listResponse);
    console.log();
    
    // Test 3: Create a new jet
    console.log('Test 3: Create a new jet');
    const createResponse = await callMcp('Create a new jet named "Boeing 747" with type Commercial and location Hangar 5');
    console.log('Response:', createResponse);
    console.log();
    
    // Test 4: Using direct function call
    console.log('Test 4: Using direct function call to list jets');
    const directResponse = await fetch('http://localhost:3001/mcp/function', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'list_jets',
        parameters: {}
      })
    });
    
    const directResult = await directResponse.json();
    console.log('Direct function call response:', directResult);
    console.log();
    
    // Test 5: Using the /mcp/run endpoint
    console.log('Test 5: Using /mcp/run endpoint');
    const runResponse = await fetch('http://localhost:3001/mcp/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        function_calls: [{
          name: 'list_jets',
          parameters: {}
        }]
      })
    });
    
    const runResult = await runResponse.json();
    console.log('MCP run response:', runResult);
    
    console.log('\n--- All tests completed ---');
  } catch (error) {
    console.error('Error testing MCP:', error);
  }
}

async function callMcp(userMessage) {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: userMessage }
      ]
    })
  });
  
  return await response.json();
}

testMcp();