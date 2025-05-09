// Simple test script for the JetKeep API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

// Create a new jet
async function createJet() {
  try {
    const response = await fetch(`${API_URL}/jets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Gulfstream G650',
        type: 'Private',
        location: 'Hangar 3'
      })
    });

    const data = await response.json();
    console.log('Created new jet:', data);
    return data;
  } catch (error) {
    console.error('Error creating jet:', error);
  }
}

// Get all jets
async function getAllJets() {
  try {
    const response = await fetch(`${API_URL}/jets`);
    const data = await response.json();
    console.log('All jets:', data);
    return data;
  } catch (error) {
    console.error('Error getting jets:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('Testing JetKeep API...');
  const newJet = await createJet();
  await getAllJets();
  
  if (newJet && newJet._id) {
    console.log(`Test passed: Successfully created and retrieved jets`);
  } else {
    console.log(`Test failed: Could not create or retrieve jets`);
  }
}

runTests();