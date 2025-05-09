import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
export declare const generateApiKey: (req: Request, res: Response) => Promise<void>;
export declare const revokeApiKey: (req: Request, res: Response) => Promise<void>;
