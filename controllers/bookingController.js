import Booking from "../models/bookingModel.js";

// @desc    Create a new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { patientName, doctorId, date, time } = req.body;

    // Validate required fields
    if (!patientName || !doctorId || !date || !time) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missingFields: {
          patientName: !patientName,
          doctorId: !doctorId,
          date: !date,
          time: !time
        }
      });
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({ 
      doctorId, 
      date, 
      time,
      status: { $ne: 'cancelled' }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }
    
    const booking = new Booking({ 
      patientName, 
      doctorId,
      date, 
      time 
    });
    
    await booking.save();

    // Get the io instance from the app
    const io = req.app.get('io');
    // Emit the slot-updated event to all connected clients
    io.emit('slot-updated', { doctorId, date, time });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}; 