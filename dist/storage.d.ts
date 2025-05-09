import { Jet, NewJet } from './types.js';
export declare const initStorage: () => Promise<void>;
export declare const getJets: () => Promise<Jet[]>;
export declare const addJet: (jet: NewJet) => Promise<Jet>;
export declare const removeJet: (id: string) => Promise<boolean>;
