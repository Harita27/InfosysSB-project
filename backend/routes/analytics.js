const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get dashboard analytics (role-based)
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'patient') {
      // Patient adherence stats
      const { data: reminders } = await supabase
        .from('reminders')
        .select('status')
        .eq('user_id', req.user.userId);

      const total = reminders?.length || 0;
      const taken = reminders?.filter(r => r.status === 'taken').length || 0;
      const missed = reminders?.filter(r => r.status === 'missed').length || 0;

      stats.totalReminders = total;
      stats.takenDoses = taken;
      stats.missedDoses = missed;
      stats.adherenceRate = total > 0 ? ((taken / total) * 100).toFixed(2) : 0;

      // Active prescriptions
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();

      if (patient) {
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('patient_id', patient.id)
          .eq('status', 'approved');

        stats.activePrescriptions = prescriptions?.length || 0;
      }

    } else if (req.user.role === 'doctor') {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();

      if (doctor) {
        // Total patients
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('patient_id')
          .eq('doctor_id', doctor.id);

        const uniquePatients = [...new Set(prescriptions?.map(p => p.patient_id))];
        stats.totalPatients = uniquePatients.length;

        // Total prescriptions
        stats.totalPrescriptions = prescriptions?.length || 0;

        // Pending prescriptions
        const { data: pending } = await supabase
          .from('prescriptions')
          .select('id')
          .eq('doctor_id', doctor.id)
          .eq('status', 'pending');

        stats.pendingPrescriptions = pending?.length || 0;
      }

    } else if (req.user.role === 'pharmacist') {
      const { data: pharmacist } = await supabase
        .from('pharmacists')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();

      if (pharmacist) {
        // Total inventory items
        const { data: inventory } = await supabase
          .from('inventory')
          .select('*')
          .eq('pharmacist_id', pharmacist.id);

        stats.totalItems = inventory?.length || 0;

        // Low stock alerts
        const lowStock = inventory?.filter(item => item.quantity <= item.threshold);
        stats.lowStockAlerts = lowStock?.length || 0;

        // Expired medicines
        const today = new Date().toISOString().split('T')[0];
        const expired = inventory?.filter(item => item.expiry_date < today);
        stats.expiredMedicines = expired?.length || 0;

        // Total stock value
        const totalValue = inventory?.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        stats.totalStockValue = totalValue?.toFixed(2) || 0;
      }

    } else if (req.user.role === 'admin') {
      // Total users by role
      const { data: users } = await supabase
        .from('users')
        .select('role');

      stats.totalPatients = users?.filter(u => u.role === 'patient').length || 0;
      stats.totalDoctors = users?.filter(u => u.role === 'doctor').length || 0;
      stats.totalPharmacists = users?.filter(u => u.role === 'pharmacist').length || 0;

      // Total prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('id');

      stats.totalPrescriptions = prescriptions?.length || 0;
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate adherence report (doctor viewing patient adherence)
router.get('/adherence/:patientId', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient user ID
    const { data: patient } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        medicine:medicines!reminders_medicine_id_fkey(name, dosage)
      `)
      .eq('user_id', patient.user_id)
      .order('reminder_date', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Error fetching adherence data', error: error.message });
    }

    const total = reminders.length;
    const taken = reminders.filter(r => r.status === 'taken').length;
    const missed = reminders.filter(r => r.status === 'missed').length;
    const adherenceRate = total > 0 ? ((taken / total) * 100).toFixed(2) : 0;

    res.json({
      patientId,
      total,
      taken,
      missed,
      adherenceRate,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save custom report
router.post('/save', authenticate, async (req, res) => {
  try {
    const { reportType, data } = req.body;

    const { data: report, error } = await supabase
      .from('reports')
      .insert([{
        user_id: req.user.userId,
        report_type: reportType,
        data: JSON.stringify(data)
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error saving report', error: error.message });
    }

    res.status(201).json({ message: 'Report saved successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
