import mongoose from 'mongoose';
export type BookingStatusType = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export interface BookingStatus {
    status: BookingStatusType;
    updatedAt: Date;
    notes?: string;
}
export interface IBooking extends mongoose.Document {
    jet: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    passengers: number;
    destination?: string;
    statusHistory: BookingStatus[];
    currentStatus: BookingStatusType;
    createdAt: Date;
    updateStatus(status: BookingStatusType, notes?: string): Promise<IBooking>;
}
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
}, {}> & {
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    passengers: number;
    jet: mongoose.Types.ObjectId;
    currentStatus: "completed" | "pending" | "confirmed" | "cancelled";
    startDate: NativeDate;
    endDate: NativeDate;
    customer: mongoose.Types.ObjectId;
    totalPrice: number;
    statusHistory: mongoose.Types.DocumentArray<{
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }> & {
        status: "completed" | "pending" | "confirmed" | "cancelled";
        updatedAt: NativeDate;
        notes?: string;
    }>;
    destination?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
