import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    console.log('--- Testing JetKeep Authentication ---\n');
    
    // Test 1: Register a new user
    console.log('Test 1: Register a new user');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    
    const registerResult = await registerResponse.json();
    console.log('Register response:', registerResult);
    console.log();
    
    // Store token for next requests
    const token = registerResult.token;
    
    if (!token) {
      throw new Error('Registration failed, no token received');
    }
    
    // Test 2: Get user profile with token
    console.log('Test 2: Get user profile with token');
    const profileResponse = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const profileResult = await profileResponse.json();
    console.log('Profile response:', profileResult);
    console.log();
    
    // Test 3: Generate API key
    console.log('Test 3: Generate API key');
    const apiKeyResponse = await fetch(`${API_URL}/auth/api-key`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const apiKeyResult = await apiKeyResponse.json();
    console.log('API key response:', apiKeyResult);
    console.log();
    
    // Store API key for next requests
    const apiKey = apiKeyResult.apiKey;
    
    if (!apiKey) {
      throw new Error('API key generation failed');
    }
    
    // Test 4: Access jets API with API key
    console.log('Test 4: Access jets API with API key');
    const jetsResponse = await fetch(`${API_URL}/jets`, {
      headers: { 'X-API-Key': apiKey }
    });
    
    const jetsResult = await jetsResponse.json();
    console.log('Jets response (with API key):', jetsResult);
    console.log();
    
    // Test 5: Create a jet with API key
    console.log('Test 5: Create a jet with API key');
    const jetData = {
      name: 'Test Jet',
      type: 'TestType',
      location: 'Test Hangar'
    };
    
    const createJetResponse = await fetch(`${API_URL}/jets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(jetData)
    });
    
    const createJetResult = await createJetResponse.json();
    console.log('Create jet response:', createJetResult);
    console.log();
    
    // Test 6: Accessing MCP with API key
    console.log('Test 6: Accessing MCP API with API key');
    const mcpData = {
      messages: [{ role: 'user', content: 'List all jets' }]
    };
    
    const mcpResponse = await fetch('http://localhost:3001/v1/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(mcpData)
    });
    
    const mcpResult = await mcpResponse.json();
    console.log('MCP response (with API key):', mcpResult);
    
    // Test 7: Revoke API key
    console.log('Test 7: Revoke API key');
    const revokeResponse = await fetch(`${API_URL}/auth/api-key`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const revokeResult = await revokeResponse.json();
    console.log('Revoke API key response:', revokeResult);
    
    console.log('\n--- All tests completed ---');
  } catch (error) {
    console.error('Error testing authentication:', error);
  }
}

testAuth();