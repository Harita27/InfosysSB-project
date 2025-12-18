const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const supabase = require('./config/supabase');
const app = express();
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://infosyssb1.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

//Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Supabase Connection Error:', error.message);
    } else {
      console.log('✅ Supabase Connected');
    }
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
  }
})();
//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/analytics', require('./routes/analytics'));
//Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Online Medication & Prescription Tracker API is running' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
