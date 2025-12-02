const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get all inventory items (pharmacist only)
router.get('/', authenticate, authorize(['pharmacist', 'admin']), async (req, res) => {
  try {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        pharmacist:pharmacists!inventory_pharmacist_id_fkey(
          id,
          pharmacy_name,
          user:users!pharmacists_user_id_fkey(name, email)
        )
      `)
      .order('expiry_date', { ascending: true });

    // Filter by pharmacist if not admin
    if (req.user.role === 'pharmacist') {
      const { data: pharmacist } = await supabase
        .from('pharmacists')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      
      if (pharmacist) {
        query = query.eq('pharmacist_id', pharmacist.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new drug to inventory
router.post('/', authenticate, authorize(['pharmacist']), async (req, res) => {
  try {
    const { drugName, batchNo, expiryDate, quantity, threshold, price } = req.body;

    // Get pharmacist ID
    const { data: pharmacist } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', req.user.userId)
      .single();

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist profile not found' });
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        pharmacist_id: pharmacist.id,
        drug_name: drugName,
        batch_no: batchNo,
        expiry_date: expiryDate,
        quantity,
        threshold: threshold || 10,
        price: price || 0
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error adding drug to inventory', error: error.message });
    }

    res.status(201).json({ message: 'Drug added to inventory successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item
router.patch('/:id', authenticate, authorize(['pharmacist']), async (req, res) => {
  try {
    const { id } = req.params;
    const { drugName, batchNo, expiryDate, quantity, threshold, price } = req.body;

    const updateData = {};
    if (drugName !== undefined) updateData.drug_name = drugName;
    if (batchNo !== undefined) updateData.batch_no = batchNo;
    if (expiryDate !== undefined) updateData.expiry_date = expiryDate;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (threshold !== undefined) updateData.threshold = threshold;
    if (price !== undefined) updateData.price = price;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating inventory', error: error.message });
    }

    res.json({ message: 'Inventory updated successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', authenticate, authorize(['pharmacist', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get low stock alerts
router.get('/alerts', authenticate, authorize(['pharmacist', 'admin']), async (req, res) => {
  try {
    let query = supabase
      .from('inventory')
      .select('*')
      .lte('quantity', supabase.raw('threshold'));

    // Filter by pharmacist if not admin
    if (req.user.role === 'pharmacist') {
      const { data: pharmacist } = await supabase
        .from('pharmacists')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      
      if (pharmacist) {
        query = query.eq('pharmacist_id', pharmacist.id);
      }
    }

    const { data, error } = await query.order('quantity', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching alerts', error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get expired medicines
router.get('/expired', authenticate, authorize(['pharmacist', 'admin']), async (req, res) => {
  try {
    let query = supabase
      .from('inventory')
      .select('*')
      .lt('expiry_date', new Date().toISOString().split('T')[0]);

    // Filter by pharmacist if not admin
    if (req.user.role === 'pharmacist') {
      const { data: pharmacist } = await supabase
        .from('pharmacists')
        .select('id')
        .eq('user_id', req.user.userId)
        .single();
      
      if (pharmacist) {
        query = query.eq('pharmacist_id', pharmacist.id);
      }
    }

    const { data, error } = await query.order('expiry_date', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching expired medicines', error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
