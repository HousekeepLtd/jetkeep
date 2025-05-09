export interface Jet {
  id: string;
  name: string;
  type?: string;
  location?: string;
  createdAt: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
  owner: string; // Owner ID (user ID)
  // Added fields for booking
  passengers?: number;
  range?: number;
  cruiseSpeed?: number;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  availability?: boolean;
  availabilityNotes?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface JetData {
  jets: Jet[];
}

export interface NewJet {
  name: string;
  type?: string;
  location?: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
  owner?: string; // Owner ID (user ID)
  // Added fields for booking
  passengers?: number;
  range?: number;
  cruiseSpeed?: number;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  availability?: boolean;
  availabilityNotes?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface UpdateJet {
  name?: string;
  type?: string;
  location?: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
  // Added fields for booking
  passengers?: number;
  range?: number;
  cruiseSpeed?: number;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  availability?: boolean;
  availabilityNotes?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface Booking {
  id: string;
  jet: string | Jet; // Jet ID or populated Jet object
  customer: string; // User ID
  startDate: string;
  endDate: string;
  totalPrice: number;
  passengers?: number;
  destination?: string;
  currentStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  statusHistory: BookingStatus[];
  createdAt: string;
}

export interface BookingStatus {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  updatedAt: string;
  notes?: string;
}

export interface NewBooking {
  jet: string; // Jet ID
  startDate: string;
  endDate: string;
  passengers?: number;
  destination?: string;
}

export interface UpdateBooking {
  startDate?: string;
  endDate?: string;
  passengers?: number;
  destination?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  statusNotes?: string;
}

export interface BookingAvailabilityCheck {
  jetId: string;
  startDate: string;
  endDate: string;
}

export interface BookingPriceQuote {
  jetId: string;
  startDate: string;
  endDate: string;
}

export interface PriceQuoteResponse {
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  totalPrice: number;
  durationHours: number;
  durationDays: number;
  jetName: string;
}