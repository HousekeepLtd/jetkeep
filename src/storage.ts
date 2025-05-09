import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { Jet, JetData, NewJet } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(os.homedir(), '.jetkeep');
const JETS_FILE = path.join(DATA_DIR, 'jets.json');

// Ensure data directory exists
export const initStorage = async (): Promise<void> => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Create jets file if it doesn't exist
    try {
      await fs.access(JETS_FILE);
    } catch (err) {
      await fs.writeFile(JETS_FILE, JSON.stringify({ jets: [] } as JetData, null, 2));
    }
  } catch (err) {
    console.error('Failed to initialize storage:', err);
    throw err;
  }
};

// Get all jets
export const getJets = async (): Promise<Jet[]> => {
  try {
    await initStorage();
    const data = await fs.readFile(JETS_FILE, 'utf8');
    return (JSON.parse(data) as JetData).jets;
  } catch (err) {
    console.error('Failed to read jets:', err);
    return [];
  }
};

// Add a new jet
export const addJet = async (jet: NewJet): Promise<Jet> => {
  try {
    await initStorage();
    const data = await fs.readFile(JETS_FILE, 'utf8');
    const jets = JSON.parse(data) as JetData;
    
    // Add unique ID and timestamp
    const newJet: Jet = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...jet
    };
    
    jets.jets.push(newJet);
    await fs.writeFile(JETS_FILE, JSON.stringify(jets, null, 2));
    return newJet;
  } catch (err) {
    console.error('Failed to add jet:', err);
    throw err;
  }
};

// Remove a jet by ID
export const removeJet = async (id: string): Promise<boolean> => {
  try {
    await initStorage();
    const data = await fs.readFile(JETS_FILE, 'utf8');
    const jets = JSON.parse(data) as JetData;
    
    const jetIndex = jets.jets.findIndex(jet => jet.id === id);
    if (jetIndex === -1) {
      throw new Error(`Jet with ID ${id} not found`);
    }
    
    jets.jets.splice(jetIndex, 1);
    await fs.writeFile(JETS_FILE, JSON.stringify(jets, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to remove jet:', err);
    throw err;
  }
};