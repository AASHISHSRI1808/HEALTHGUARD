const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const emailService = require('../services/emailService');

// @POST /api/appointments - Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, predictionId, appointmentDate, timeSlot, notes } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      predictionId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes,
      amount: doctor.consultationFee,
      status: 'Pending',
      paymentStatus: 'Pending'
    });

    await appointment.populate(['patientId', 'doctorId']);
    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/appointments - Get user appointments
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'patient' 
      ? { patientId: req.user._id }
      : {};
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email mobile')
      .populate('doctorId')
      .populate('predictionId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/appointments/:id - Single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email mobile age gender')
      .populate('doctorId')
      .populate('predictionId');
    
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/appointments/:id/confirm - Confirm after payment
router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed', paymentStatus: 'Paid', paymentId, orderId },
      { new: true }
    ).populate(['patientId', 'doctorId', 'predictionId']);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Send confirmation email
    try {
      await emailService.sendAppointmentConfirmation(appointment);
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }

    res.json({ success: true, message: 'Appointment confirmed!', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/appointments/:id/cancel
router.delete('/:id/cancel', protect, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
