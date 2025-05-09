import mongoose from 'mongoose';
const bookingStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        required: true
    },
    updatedAt: { type: Date, default: Date.now },
    notes: { type: String }
}, { _id: false });
const bookingSchema = new mongoose.Schema({
    jet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jet',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    passengers: {
        type: Number,
        default: 1
    },
    destination: {
        type: String
    },
    statusHistory: [bookingStatusSchema],
    currentStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Add a method to update status
bookingSchema.methods.updateStatus = function (status, notes) {
    this.statusHistory.push({
        status,
        updatedAt: new Date(),
        notes
    });
    this.currentStatus = status;
    return this.save();
};
export default mongoose.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map