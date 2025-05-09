import { Request, Response } from 'express';
export declare const getJets: (req: Request, res: Response) => Promise<void>;
export declare const getJetById: (req: Request, res: Response) => Promise<void>;
export declare const createJet: (req: Request, res: Response) => Promise<void>;
export declare const updateJet: (req: Request, res: Response) => Promise<void>;
export declare const deleteJet: (req: Request, res: Response) => Promise<void>;
export declare const getAvailableJets: (req: Request, res: Response) => Promise<void>;
