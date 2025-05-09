import mongoose from 'mongoose';
const jetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Jet', jetSchema);
//# sourceMappingURL=Jet.js.map