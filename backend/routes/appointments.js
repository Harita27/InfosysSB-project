const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const supabase = require('../config/supabase');

// Create appointment (Patient)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason } = req.body;

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patient.id,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        reason,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get appointments (for both doctor and patient)
router.get('/', auth, async (req, res) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          *,
          user:users!patients_user_id_fkey(id, email, first_name, last_name, phone)
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          *,
          user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
        )
      `)
      .order('appointment_date', { ascending: false });

    if (req.user.role === 'doctor') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      query = query.eq('doctor_id', doctor.id);
    } else {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      query = query.eq('patient_id', patient.id);
    }

    const { data: appointments, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ status, notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }

    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
