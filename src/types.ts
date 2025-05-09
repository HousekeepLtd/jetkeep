export interface Jet {
  id: string;
  name: string;
  type?: string;
  location?: string;
  createdAt: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
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
}

export interface UpdateJet {
  name?: string;
  type?: string;
  location?: string;
  status?: 'active' | 'maintenance' | 'grounded';
  notes?: string;
}