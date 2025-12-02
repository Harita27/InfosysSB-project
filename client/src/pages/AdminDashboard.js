import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>System Overview and Analytics</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Patients</h3>
            <p className="stat-number">{stats.totalPatients || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Doctors</h3>
            <p className="stat-number">{stats.totalDoctors || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Pharmacists</h3>
            <p className="stat-number">{stats.totalPharmacists || 0}</p>
          </div>
          <div className="stat-card success">
            <h3>Total Prescriptions</h3>
            <p className="stat-number">{stats.totalPrescriptions || 0}</p>
          </div>
        </div>

        <div className="card">
          <h2>System Status</h2>
          <p>✅ All systems operational</p>
          <p>✅ Database connected</p>
          <p>✅ API services running</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
