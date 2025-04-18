import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema); 