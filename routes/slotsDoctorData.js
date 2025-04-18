import express from 'express';
const router = express.Router();

// Initialize with all slots for each doctor
const ALL_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];

let DOCTORS_DATA = [
  {
    _id: "1",
    name: "John Smith",
    specialization: "Cardiologist",
    allSlots: ALL_SLOTS,
    bookedSlots: [] // Array of {date, slot}
  },
  {
    _id: "2",
    name: "Sarah Johnson",
    specialization: "Cardiologist",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "3",
    name: "Michael Brown",
    specialization: "Neurologist",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "4",
    name: "Emily Davis",
    specialization: "Pediatrician",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "5",
    name: "David Wilson",
    specialization: "Orthopedic",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "6",
    name: "Lisa Anderson",
    specialization: "Dermatologist",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "7",
    name: "Robert Taylor",
    specialization: "Ophthalmologist",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  },
  {
    _id: "8",
    name: "Jennifer Martinez",
    specialization: "Pediatrician",
    allSlots: ALL_SLOTS,
    bookedSlots: []
  }
];

// GET all doctors
router.get('/', (req, res) => {
  res.json(DOCTORS_DATA);
});

// POST add a new doctor
router.post('/', (req, res) => {
  const newDoctor = { 
    _id: (Date.now()).toString(), 
    ...req.body,
    allSlots: ALL_SLOTS,
    bookedSlots: []
  };
  DOCTORS_DATA.push(newDoctor);
  res.status(201).json(newDoctor);
});

// PUT book a slot
router.put('/:id/book', (req, res) => {
  const { slot, date } = req.body;
  const doctor = DOCTORS_DATA.find(d => d._id === req.params.id);
  
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

  // Add to booked slots
  doctor.bookedSlots.push({ date, slot });

  // Get the io instance
  const io = req.app.get('io');
  
  // Emit slot update event
  io.emit('slot-update', {
    doctorId: doctor._id,
    allSlots: doctor.allSlots,
    bookedSlots: doctor.bookedSlots
  });

  res.json({
    allSlots: doctor.allSlots,
    bookedSlots: doctor.bookedSlots
  });
});

// GET doctor slots
router.get('/:id/slots', (req, res) => {
  const doctor = DOCTORS_DATA.find(d => d._id === req.params.id);
  
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  res.json({
    allSlots: doctor.allSlots,
    bookedSlots: doctor.bookedSlots
  });
});

export default router;
