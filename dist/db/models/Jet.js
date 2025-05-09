import mongoose from 'mongoose';
const jetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    location: { type: String },
    status: { type: String, enum: ['active', 'maintenance', 'grounded'], default: 'active' },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Jet specifications
    passengers: { type: Number, default: 0 },
    range: { type: Number, default: 0 }, // Range in nautical miles
    cruiseSpeed: { type: Number, default: 0 }, // Speed in knots
    // Pricing information
    hourlyRate: { type: Number, default: 0 }, // Price per hour in USD
    dailyRate: { type: Number, default: 0 }, // Price per day in USD
    weeklyRate: { type: Number, default: 0 }, // Price per week in USD
    // Availability
    availability: { type: Boolean, default: true },
    availabilityNotes: { type: String },
    // Additional information
    description: { type: String },
    amenities: [{ type: String }],
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
// Method to calculate booking price
jetSchema.methods.calculatePrice = function (startDate, endDate) {
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    const days = hours / 24;
    const weeks = days / 7;
    let totalPrice = 0;
    if (weeks >= 1) {
        // Calculate price using weekly rate for complete weeks
        const completeWeeks = Math.floor(weeks);
        totalPrice += completeWeeks * this.weeklyRate;
        // Calculate remaining days using daily rate
        const remainingDays = Math.ceil(days - (completeWeeks * 7));
        totalPrice += remainingDays * this.dailyRate;
    }
    else if (days >= 1) {
        // Calculate price using daily rate for complete days
        const completeDays = Math.floor(days);
        totalPrice += completeDays * this.dailyRate;
        // Calculate remaining hours using hourly rate
        const remainingHours = Math.ceil(hours - (completeDays * 24));
        totalPrice += remainingHours * this.hourlyRate;
    }
    else {
        // Calculate price using hourly rate
        const totalHours = Math.ceil(hours);
        totalPrice += totalHours * this.hourlyRate;
    }
    return totalPrice;
};
// Check if jet is available for booking in the specified period
jetSchema.methods.isAvailableForBooking = async function (startDate, endDate) {
    if (!this.availability)
        return false;
    // Check for overlapping bookings
    const Booking = mongoose.model('Booking');
    const overlappingBookings = await Booking.countDocuments({
        jet: this._id,
        currentStatus: { $in: ['pending', 'confirmed'] },
        $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
            { startDate: { $gte: startDate, $lt: endDate } },
            { endDate: { $gt: startDate, $lte: endDate } }
        ]
    });
    return overlappingBookings === 0;
};
export default mongoose.model('Jet', jetSchema);
//# sourceMappingURL=Jet.js.map