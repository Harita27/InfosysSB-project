const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const supabase = require('../config/supabase');

// Get patient profile
router.get('/profile', auth, authorize('patient'), async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        *,
        user:users!patients_user_id_fkey(id, email, first_name, last_name, phone),
        assigned_doctor:doctors!patients_assigned_doctor_id_fkey(
          *,
          user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
        )
      `)
      .eq('user_id', req.userId)
      .single();
    
    if (error || !patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient profile
router.put('/profile', auth, authorize('patient'), async (req, res) => {
  try {
    const { dateOfBirth, gender, bloodGroup, allergies } = req.body;

    const { data: patient, error } = await supabase
      .from('patients')
      .update({
        date_of_birth: dateOfBirth,
        gender,
        blood_group: bloodGroup,
        allergies,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.userId)
      .select(`
        *,
        user:users!patients_user_id_fkey(id, email, first_name, last_name, phone)
      `)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating profile', error: error.message });
    }

    res.json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add symptom
router.post('/symptoms', auth, authorize('patient'), async (req, res) => {
  try {
    const { description, severity } = req.body;

    // Get patient id
    const { data: patient } = await supabase
      .from('patients')
      .select('id, symptoms')
      .eq('user_id', req.userId)
      .single();

    const symptoms = patient.symptoms || [];
    symptoms.push({ description, severity, date: new Date().toISOString() });

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({ symptoms })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error adding symptom', error: error.message });
    }

    res.json({ message: 'Symptom added successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add medical history
router.post('/medical-history', auth, authorize('patient'), async (req, res) => {
  try {
    const { condition, diagnosedDate, notes } = req.body;

    // Get patient id
    const { data: patient } = await supabase
      .from('patients')
      .select('id, medical_history')
      .eq('user_id', req.userId)
      .single();

    const medicalHistory = patient.medical_history || [];
    medicalHistory.push({ condition, diagnosedDate, notes });

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({ medical_history: medicalHistory })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error adding medical history', error: error.message });
    }

    res.json({ message: 'Medical history added successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all doctors (for patient to view)
router.get('/doctors', auth, authorize('patient'), async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        *,
        user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
      `);

    if (error) {
      return res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
