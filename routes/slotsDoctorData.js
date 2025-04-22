import express from 'express';
import DoctorSlot from '../models/doctorSlot.js';
import Booking from '../models/bookingModel.js';

const router = express.Router();

// Initialize with all slots for each doctor
const ALL_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];

// GET all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await DoctorSlot.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a new doctor
router.post('/', async (req, res) => {
  try {
    const newDoctor = new DoctorSlot({
      ...req.body,
      allSlots: ALL_SLOTS,
      bookedSlots: []
    });
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT book a slot
router.put('/:id/book', async (req, res) => {
  try {
    const { slot, date, patientName } = req.body;
    const doctor = await DoctorSlot.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if slot is already booked for this date
    const isSlotBooked = doctor.bookedSlots.some(
      booking => booking.date === date && booking.slot === slot
    );

    if (isSlotBooked) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Create a new booking record
    const newBooking = new Booking({
      patientName,
      doctorId: doctor._id,
      date,
      time: slot,
      status: 'confirmed'
    });
    await newBooking.save();

    // Add to doctor's booked slots
    doctor.bookedSlots.push({ date, slot });
    await doctor.save();

    // Get the io instance
    const io = req.app.get('io');
    
    // Emit slot update event
    io.emit('slot-update', {
      doctorId: doctor._id,
      allSlots: doctor.allSlots,
      bookedSlots: doctor.bookedSlots
    });

    res.json({
      message: 'Booking created successfully',
      booking: newBooking,
      allSlots: doctor.allSlots,
      bookedSlots: doctor.bookedSlots
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET doctor slots
router.get('/:id/slots', async (req, res) => {
  try {
    const doctor = await DoctorSlot.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      allSlots: doctor.allSlots,
      bookedSlots: doctor.bookedSlots
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
