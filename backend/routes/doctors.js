const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const supabase = require('../config/supabase');

// Get doctor profile
router.get('/profile', auth, authorize('doctor'), async (req, res) => {
  try {
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        *,
        user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
      `)
      .eq('user_id', req.userId)
      .single();
    
    if (error || !doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get patients count
    const { data: patients } = await supabase
      .from('doctor_patients')
      .select('patient_id')
      .eq('doctor_id', doctor.id);

    doctor.patients = patients || [];

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doctor profile
router.put('/profile', auth, authorize('doctor'), async (req, res) => {
  try {
    const { licenseNumber, specialization, description, qualifications, experience, availability, consultationFee } = req.body;

    const { data: updatedDoctor, error } = await supabase
      .from('doctors')
      .update({
        license_number: licenseNumber,
        specialization,
        description,
        qualifications,
        experience,
        availability,
        consultation_fee: consultationFee,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.userId)
      .select(`
        *,
        user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
      `)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating profile', error: error.message });
    }

    res.json({ message: 'Profile updated successfully', doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctor's patients
router.get('/patients', auth, authorize('doctor'), async (req, res) => {
  try {
    // Get doctor id
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    const { data: doctorPatients, error } = await supabase
      .from('doctor_patients')
      .select(`
        patient:patients!doctor_patients_patient_id_fkey(
          *,
          user:users!patients_user_id_fkey(id, email, first_name, last_name, phone)
        )
      `)
      .eq('doctor_id', doctor.id);

    if (error) {
      return res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }

    const patients = doctorPatients.map(dp => dp.patient);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add patient to doctor
router.post('/patients/:patientId', auth, authorize('doctor'), async (req, res) => {
  try {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', req.params.patientId)
      .single();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('doctor_patients')
      .select('*')
      .eq('doctor_id', doctor.id)
      .eq('patient_id', patient.id)
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('doctor_patients')
        .insert([{
          doctor_id: doctor.id,
          patient_id: patient.id
        }]);

      if (error) {
        return res.status(500).json({ message: 'Error adding patient', error: error.message });
      }
    }

    // Update patient's assigned doctor
    await supabase
      .from('patients')
      .update({ assigned_doctor_id: doctor.id })
      .eq('id', patient.id);

    res.json({ message: 'Patient added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
