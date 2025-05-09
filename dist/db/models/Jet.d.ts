import mongoose from 'mongoose';
export interface IJet extends mongoose.Document {
    status?: 'active' | 'maintenance' | 'grounded';
    name: string;
    type?: string;
    location?: string;
    owner: mongoose.Types.ObjectId;
    passengers: number;
    range: number;
    cruiseSpeed: number;
    hourlyRate: number;
    dailyRate: number;
    weeklyRate: number;
    availability: boolean;
    availabilityNotes?: string;
    description?: string;
    amenities?: string[];
    images?: string[];
    createdAt: Date;
    calculatePrice(startDate: Date, endDate: Date): number;
    isAvailableForBooking(startDate: Date, endDate: Date): Promise<boolean>;
}
declare const _default: mongoose.Model<IJet, {}, {}, {}, mongoose.Document<unknown, {}, IJet, {}> & IJet & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
