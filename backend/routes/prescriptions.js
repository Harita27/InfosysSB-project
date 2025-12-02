const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get all prescriptions (filtered by role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors!prescriptions_doctor_id_fkey(
          id,
          user:users!doctors_user_id_fkey(name, email)
        ),
        patient:patients!prescriptions_patient_id_fkey(
          id,
          user:users!patients_user_id_fkey(name, email)
        ),
        medicines(*)
      `);

    // Filter based on role
    if (req.user.role === 'doctor') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      
      if (doctor) {
        query = query.eq('doctor_id', doctor.id);
      }
    } else if (req.user.role === 'patient') {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      
      if (patient) {
        query = query.eq('patient_id', patient.id);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new prescription (doctor only)
router.post('/', authenticate, authorize(['doctor']), async (req, res) => {
  try {
    const { patientId, fileUrl, expiryDate, notes, medicines } = req.body;

    // Get doctor ID
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Create prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert([{
        doctor_id: doctor.id,
        patient_id: patientId,
        file_url: fileUrl,
        expiry_date: expiryDate,
        status: 'approved',
        notes
      }])
      .select()
      .single();

    if (prescriptionError) {
      return res.status(500).json({ message: 'Error creating prescription', error: prescriptionError.message });
    }

    // Add medicines if provided
    if (medicines && medicines.length > 0) {
      const medicinesData = medicines.map(med => ({
        prescription_id: prescription.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        reminder_time: med.reminderTime,
        instructions: med.instructions
      }));

      const { error: medicinesError } = await supabase
        .from('medicines')
        .insert(medicinesData);

      if (medicinesError) {
        return res.status(500).json({ message: 'Error adding medicines', error: medicinesError.message });
      }
    }

    res.status(201).json({ message: 'Prescription created successfully', prescription });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update prescription status
router.patch('/:id/status', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating prescription status', error: error.message });
    }

    res.json({ message: 'Prescription status updated', data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete prescription
router.delete('/:id', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Error deleting prescription', error: error.message });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
