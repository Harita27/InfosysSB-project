const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, licenseNumber, specialization } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        role,
        first_name: firstName,
        last_name: lastName,
        phone
      }])
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Error creating user', error: userError.message });
    }

    // Create role-specific profile
    if (role === 'doctor') {
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([{
          user_id: user.id,
          license_number: licenseNumber || 'PENDING',
          specialization: specialization || 'General'
        }]);

      if (doctorError) {
        return res.status(500).json({ message: 'Error creating doctor profile', error: doctorError.message });
      }
    } else if (role === 'patient') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert([{
          user_id: user.id
        }]);

      if (patientError) {
        return res.status(500).json({ message: 'Error creating patient profile', error: patientError.message });
      }
    } else if (role === 'pharmacist') {
      const { error: pharmacistError } = await supabase
        .from('pharmacists')
        .insert([{
          user_id: user.id,
          license_number: licenseNumber || 'PENDING',
          pharmacy_name: 'My Pharmacy',
          pharmacy_address: ''
        }]);

      if (pharmacistError) {
        return res.status(500).json({ message: 'Error creating pharmacist profile', error: pharmacistError.message });
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
