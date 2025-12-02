const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get all reminders for a user
router.get('/reminders', authenticate, async (req, res) => {
  try {
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        medicine:medicines!reminders_medicine_id_fkey(
          id,
          name,
          dosage,
          frequency,
          instructions
        )
      `)
      .eq('user_id', req.user.userId)
      .order('time', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching reminders', error: error.message });
    }

    res.json(reminders || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a reminder
router.post('/reminders', authenticate, async (req, res) => {
  try {
    const { medicineId, time, reminderDate } = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        medicine_id: medicineId,
        user_id: req.user.userId,
        time,
        reminder_date: reminderDate || new Date().toISOString().split('T')[0],
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error creating reminder', error: error.message });
    }

    res.status(201).json({ message: 'Reminder created successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reminder status (taken, missed, snoozed)
router.patch('/reminders/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('reminders')
      .update({ status })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating reminder', error: error.message });
    }

    res.json({ message: 'Reminder updated successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get adherence statistics
router.get('/adherence', authenticate, authorize(['patient']), async (req, res) => {
  try {
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('status')
      .eq('user_id', req.user.userId);

    if (error) {
      return res.status(500).json({ message: 'Error fetching adherence data', error: error.message });
    }

    const total = reminders.length;
    const taken = reminders.filter(r => r.status === 'taken').length;
    const missed = reminders.filter(r => r.status === 'missed').length;
    const pending = reminders.filter(r => r.status === 'pending').length;

    const adherencePercentage = total > 0 ? ((taken / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      taken,
      missed,
      pending,
      adherencePercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
