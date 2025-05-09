import fetch from 'node-fetch';

const OFFICIAL_MCP_URL = 'http://localhost:3005/v1';

async function testOfficialMcp() {
  try {
    console.log('--- Testing JetKeep Official MCP API ---\n');
    
    // First, get an API key
    console.log('Getting API key...');
    const loginData = {
      email: 'admin@jetkeep.com',
      password: 'admin123'
    };
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.token) {
      throw new Error('Login failed');
    }
    
    console.log('Successfully logged in with admin account');
    
    // Generate API key
    const apiKeyResponse = await fetch('http://localhost:3000/api/auth/api-key', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${loginResult.token}` }
    });
    
    const apiKeyResult = await apiKeyResponse.json();
    
    if (!apiKeyResult.apiKey) {
      throw new Error('Failed to generate API key');
    }
    
    const apiKey = apiKeyResult.apiKey;
    console.log('Successfully generated API key:', apiKey);
    
    // Test 1: Simple text request
    console.log('\nTest 1: Simple text request');
    const simpleResponse = await callMcp({
      messages: [
        { role: "user", content: "What can you do?" }
      ]
    }, apiKey);
    console.log('Response:', simpleResponse);
    
    // Test 2: List Jets
    console.log('\nTest 2: List Jets Tool');
    const listJetsResponse = await callMcp({
      messages: [
        { role: "user", content: "List all the jets" }
      ]
    }, apiKey);
    console.log('Response:', listJetsResponse);
    
    // Test 3: Create a jet
    console.log('\nTest 3: Create Jet Tool');
    const createJetResponse = await callMcp({
      messages: [
        { role: "user", content: "Create a new jet named \"Test Jet\" with type Business and location \"Hangar 1\"" }
      ]
    }, apiKey);
    console.log('Response:', createJetResponse);
    
    // Test 4: Direct function calling
    console.log('\nTest 4: Direct function call');
    const functionCallResponse = await callMcp({
      functions: [
        {
          name: "list_jets",
          arguments: "{}"
        }
      ]
    }, apiKey);
    console.log('Response:', functionCallResponse);
    
    // Revoke API key when done
    console.log('\nRevoking API key...');
    await fetch('http://localhost:3000/api/auth/api-key', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${loginResult.token}` }
    });
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Error testing Official MCP:', error);
  }
}

async function callMcp(requestBody, apiKey) {
  const response = await fetch(OFFICIAL_MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify(requestBody)
  });
  
  return await response.json();
}

testOfficialMcp();