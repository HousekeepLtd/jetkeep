import { Request, Response } from 'express';
export declare const getBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<void>;
export declare const createBooking: (req: Request, res: Response) => Promise<void>;
export declare const updateBookingStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateBooking: (req: Request, res: Response) => Promise<void>;
export declare const deleteBooking: (req: Request, res: Response) => Promise<void>;
export declare const checkAvailability: (req: Request, res: Response) => Promise<void>;
export declare const getPriceQuote: (req: Request, res: Response) => Promise<void>;
