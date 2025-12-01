const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const supabase = require('../config/supabase');

// Create medical record (Doctor only)
router.post('/', auth, authorize('doctor'), async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, labReports, doctorNotes, followUpDate } = req.body;

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.userId)
      .single();
    
    const { data: medicalRecord, error } = await supabase
      .from('medical_records')
      .insert([{
        patient_id: patientId,
        doctor_id: doctor.id,
        diagnosis,
        prescription,
        lab_reports: labReports,
        doctor_notes: doctorNotes,
        follow_up_date: followUpDate
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error creating medical record', error: error.message });
    }

    res.status(201).json({ message: 'Medical record created successfully', medicalRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get medical records
router.get('/', auth, async (req, res) => {
  try {
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
          *,
          user:users!patients_user_id_fkey(id, email, first_name, last_name, phone)
        ),
        doctor:doctors!medical_records_doctor_id_fkey(
          *,
          user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
        )
      `)
      .order('created_at', { ascending: false });

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

    const { data: records, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching records', error: error.message });
    }

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single medical record
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: record, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
          *,
          user:users!patients_user_id_fkey(id, email, first_name, last_name, phone)
        ),
        doctor:doctors!medical_records_doctor_id_fkey(
          *,
          user:users!doctors_user_id_fkey(id, email, first_name, last_name, phone)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
