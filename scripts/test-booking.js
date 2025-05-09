import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
let token = null;
let userId = null;
let jetId = null;
let bookingId = null;

// Login to get a token
const login = async () => {
  try {
    console.log('Logging in...');
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@jetkeep.com',
        password: 'admin123',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Login failed: ${data.message}`);
    }
    
    token = data.token;
    userId = data.user.id;
    console.log('Login successful');
    return token;
  } catch (error) {
    console.error('Login error:', error.message);
    process.exit(1);
  }
};

// Create a test jet
const createJet = async () => {
  try {
    console.log('Creating a test jet...');
    const response = await fetch(`${API_URL}/api/jets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test Jet for Booking',
        type: 'Private',
        location: 'Test Hangar',
        passengers: 8,
        range: 4000,
        cruiseSpeed: 500,
        hourlyRate: 5000,
        dailyRate: 30000,
        weeklyRate: 180000
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to create jet: ${data.message}`);
    }
    
    jetId = data._id;
    console.log(`Test jet created with ID: ${jetId}`);
    return jetId;
  } catch (error) {
    console.error('Error creating jet:', error.message);
    process.exit(1);
  }
};

// Get availability for the jet
const checkAvailability = async () => {
  try {
    console.log('Checking jet availability...');
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 2 days from now
    
    const response = await fetch(`${API_URL}/api/bookings/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jetId: jetId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to check availability: ${data.message}`);
    }
    
    console.log('Availability check result:', data);
    
    if (data.available) {
      console.log('Jet is available for booking');
    } else {
      console.log('Jet is not available for the specified dates');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking availability:', error.message);
  }
};

// Get a price quote
const getPriceQuote = async () => {
  try {
    console.log('Getting price quote...');
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 2 days from now
    
    const response = await fetch(`${API_URL}/api/bookings/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jetId: jetId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        passengers: 4
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get price quote: ${data.message}`);
    }
    
    console.log('Price quote:', data);
    console.log(`Total price: $${data.totalPrice}`);
    
    return data;
  } catch (error) {
    console.error('Error getting price quote:', error.message);
  }
};

// Create a booking
const createBooking = async () => {
  try {
    console.log('Creating a booking...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start 1 day from now
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // End 2 days after start
    
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jet: jetId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        passengers: 4,
        destination: 'Paris, France'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to create booking: ${data.message}`);
    }
    
    bookingId = data._id;
    console.log(`Booking created with ID: ${bookingId}`);
    console.log('Booking details:', data);
    
    return data;
  } catch (error) {
    console.error('Error creating booking:', error.message);
  }
};

// Get all bookings
const getBookings = async () => {
  try {
    console.log('Getting all bookings...');
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get bookings: ${data.message}`);
    }
    
    console.log(`Found ${data.length} bookings:`);
    data.forEach(booking => {
      console.log(`- Booking ${booking._id}: ${booking.currentStatus} | ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`);
    });
    
    return data;
  } catch (error) {
    console.error('Error getting bookings:', error.message);
  }
};

// Update booking status
const updateBookingStatus = async () => {
  if (!bookingId) {
    console.log('No booking ID available. Skipping status update.');
    return;
  }
  
  try {
    console.log('Updating booking status...');
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'confirmed',
        notes: 'Payment received'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to update booking status: ${data.message}`);
    }
    
    console.log('Booking status updated:');
    console.log(`- New status: ${data.currentStatus}`);
    console.log('- Status history:', data.statusHistory);
    
    return data;
  } catch (error) {
    console.error('Error updating booking status:', error.message);
  }
};

// Get booking by ID
const getBookingById = async () => {
  if (!bookingId) {
    console.log('No booking ID available. Skipping get booking by ID.');
    return;
  }
  
  try {
    console.log(`Getting booking with ID: ${bookingId}...`);
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get booking: ${data.message}`);
    }
    
    console.log('Booking details:');
    console.log(`- Jet: ${data.jet}`);
    console.log(`- Status: ${data.currentStatus}`);
    console.log(`- Dates: ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`);
    console.log(`- Price: $${data.totalPrice}`);
    
    return data;
  } catch (error) {
    console.error('Error getting booking:', error.message);
  }
};

// Update booking details
const updateBooking = async () => {
  if (!bookingId) {
    console.log('No booking ID available. Skipping booking update.');
    return;
  }
  
  try {
    console.log('Updating booking details...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2); // Start 2 days from now
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // End 3 days after start
    
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        passengers: 6,
        destination: 'Rome, Italy'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to update booking: ${data.message}`);
    }
    
    console.log('Booking updated:');
    console.log(`- New dates: ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`);
    console.log(`- New passengers: ${data.passengers}`);
    console.log(`- New destination: ${data.destination}`);
    
    return data;
  } catch (error) {
    console.error('Error updating booking:', error.message);
  }
};

// Delete a booking
const deleteBooking = async () => {
  if (!bookingId) {
    console.log('No booking ID available. Skipping booking deletion.');
    return;
  }
  
  try {
    console.log(`Deleting booking with ID: ${bookingId}...`);
    const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to delete booking: ${data.message}`);
    }
    
    console.log('Booking deleted successfully:', data.message);
    bookingId = null;
    
    return data;
  } catch (error) {
    console.error('Error deleting booking:', error.message);
  }
};

// Delete the test jet
const deleteJet = async () => {
  if (!jetId) {
    console.log('No jet ID available. Skipping jet deletion.');
    return;
  }
  
  try {
    console.log(`Deleting test jet with ID: ${jetId}...`);
    const response = await fetch(`${API_URL}/api/jets/${jetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to delete jet: ${data.message}`);
    }
    
    console.log('Test jet deleted successfully:', data.message);
    jetId = null;
    
    return data;
  } catch (error) {
    console.error('Error deleting jet:', error.message);
  }
};

// Check available jets
const getAvailableJets = async () => {
  try {
    console.log('Getting available jets...');
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 2 days from now
    
    const url = new URL(`${API_URL}/api/jets/available`);
    url.searchParams.append('startDate', startDate.toISOString());
    url.searchParams.append('endDate', endDate.toISOString());
    url.searchParams.append('minPassengers', '4');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get available jets: ${data.message}`);
    }
    
    console.log(`Found ${data.length} available jets:`);
    data.forEach(jet => {
      console.log(`- ${jet.name} (ID: ${jet._id}) | Rate: $${jet.hourlyRate}/hour`);
    });
    
    return data;
  } catch (error) {
    console.error('Error getting available jets:', error.message);
  }
};

// Run all tests in sequence
const runTests = async () => {
  console.log('=== JETKEEP BOOKING API TEST ===');
  
  await login();
  await createJet();
  await checkAvailability();
  await getPriceQuote();
  await createBooking();
  await getBookings();
  await updateBookingStatus();
  await getBookingById();
  await updateBooking();
  await getAvailableJets();
  await deleteBooking();
  await deleteJet();
  
  console.log('=== TEST COMPLETED ===');
};

runTests();