const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, licenseNumber, specialization } = req.body;

    console.log('📝 Registration attempt:', { email, role, name: `${firstName} ${lastName}` });

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Combine first and last name
    const fullName = `${firstName} ${lastName}`;

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        name: fullName,
        email,
        password: hashedPassword,
        role,
        phone
      }])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating user:', userError.message);
      return res.status(500).json({ message: 'Error creating user', error: userError.message });
    }

    console.log('✅ User created successfully:', { id: user.id, email: user.email, role: user.role });

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
        console.error('❌ Error creating doctor profile:', doctorError.message);
        return res.status(500).json({ message: 'Error creating doctor profile', error: doctorError.message });
      }
      console.log('✅ Doctor profile created for user:', user.id);
    } else if (role === 'patient') {
      const { error: patientError } = await supabase
        .from('patients')
        .insert([{
          user_id: user.id
        }]);

      if (patientError) {
        console.error('❌ Error creating patient profile:', patientError.message);
        return res.status(500).json({ message: 'Error creating patient profile', error: patientError.message });
      }
      console.log('✅ Patient profile created for user:', user.id);
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
        console.error('❌ Error creating pharmacist profile:', pharmacistError.message);
        return res.status(500).json({ message: 'Error creating pharmacist profile', error: pharmacistError.message });
      }
      console.log('✅ Pharmacist profile created for user:', user.id);
    } else if (role === 'admin') {
      console.log('✅ Admin user created (no additional profile needed)');
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Registration completed successfully for:', email);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
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
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
