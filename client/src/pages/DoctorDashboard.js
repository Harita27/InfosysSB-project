import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    licenseNumber: '',
    specialization: '',
    description: '',
    experience: 0,
    consultationFee: 0,
    availability: 'Available'
  });

  // Medical record form state
  const [recordForm, setRecordForm] = useState({
    patientId: '',
    diagnosis: '',
    prescription: [{ medicine: '', dosage: '', duration: '', instructions: '' }],
    doctorNotes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [profileRes, patientsRes, appointmentsRes, recordsRes] = await Promise.all([
        api.get('/doctors/profile'),
        api.get('/doctors/patients'),
        api.get('/appointments'),
        api.get('/medical-records')
      ]);

      setProfile(profileRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
      setMedicalRecords(recordsRes.data);

      setProfileForm({
        licenseNumber: profileRes.data.licenseNumber,
        specialization: profileRes.data.specialization,
        description: profileRes.data.description || '',
        experience: profileRes.data.experience || 0,
        consultationFee: profileRes.data.consultationFee || 0,
        availability: profileRes.data.availability || 'Available'
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/doctors/profile', profileForm);
      setMessage('Profile updated successfully!');
      fetchDoctorData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', recordForm);
      setMessage('Medical record created successfully!');
      setRecordForm({
        patientId: '',
        diagnosis: '',
        prescription: [{ medicine: '', dosage: '', duration: '', instructions: '' }],
        doctorNotes: '',
        followUpDate: ''
      });
      fetchDoctorData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error creating medical record');
    }
  };

  const addPrescriptionRow = () => {
    setRecordForm({
      ...recordForm,
      prescription: [...recordForm.prescription, { medicine: '', dosage: '', duration: '', instructions: '' }]
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <button 
            className={activeTab === 'profile' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={activeTab === 'patients' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('patients')}
          >
            👥 My Patients
          </button>
          <button 
            className={activeTab === 'appointments' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={activeTab === 'records' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('records')}
          >
            📋 Medical Records
          </button>
          <button 
            className={activeTab === 'create-record' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('create-record')}
          >
            ➕ Create Record
          </button>
        </div>

        <div className="dashboard-content">
          {message && <div className="alert success">{message}</div>}

          {activeTab === 'profile' && (
            <div className="card">
              <h2>Doctor Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={profileForm.licenseNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Professional Description</label>
                  <textarea
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    placeholder="Tell patients about yourself..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input
                      type="number"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={profileForm.consultationFee}
                      onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <select
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">Update Profile</button>
              </form>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="card">
              <h2>My Patients ({patients.length})</h2>
              {patients.length === 0 ? (
                <p>No patients assigned yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.userId?.firstName} {patient.userId?.lastName}</td>
                        <td>{patient.userId?.email}</td>
                        <td>{patient.userId?.phone || 'N/A'}</td>
                        <td>{patient.bloodGroup || 'N/A'}</td>
                        <td>{patient.gender || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="card">
              <h2>Appointments</h2>
              {appointments.length === 0 ? (
                <p>No appointments scheduled.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt._id}>
                        <td>{apt.patient?.userId?.firstName} {apt.patient?.userId?.lastName}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleString()}</td>
                        <td>{apt.reason}</td>
                        <td>
                          <span className={`badge badge-${apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'warning'}`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'records' && (
            <div className="card">
              <h2>Medical Records</h2>
              {medicalRecords.length === 0 ? (
                <p>No medical records yet.</p>
              ) : (
                <div className="records-list">
                  {medicalRecords.map((record) => (
                    <div key={record._id} className="record-item">
                      <h3>Patient: {record.patient?.userId?.firstName} {record.patient?.userId?.lastName}</h3>
                      <p><strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                      <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                      <p><strong>Notes:</strong> {record.doctorNotes}</p>
                      {record.prescription.length > 0 && (
                        <div>
                          <strong>Prescription:</strong>
                          <ul>
                            {record.prescription.map((med, idx) => (
                              <li key={idx}>{med.medicine} - {med.dosage} ({med.duration})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create-record' && (
            <div className="card">
              <h2>Create Medical Record</h2>
              <form onSubmit={handleCreateRecord}>
                <div className="form-group">
                  <label>Select Patient</label>
                  <select
                    value={recordForm.patientId}
                    onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.userId?.firstName} {patient.userId?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Diagnosis</label>
                  <textarea
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    required
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div className="form-group">
                  <label>Prescription</label>
                  {recordForm.prescription.map((med, idx) => (
                    <div key={idx} className="prescription-row">
                      <input
                        type="text"
                        placeholder="Medicine"
                        value={med.medicine}
                        onChange={(e) => {
                          const newPrescription = [...recordForm.prescription];
                          newPrescription[idx].medicine = e.target.value;
                          setRecordForm({ ...recordForm, prescription: newPrescription });
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => {
                          const newPrescription = [...recordForm.prescription];
                          newPrescription[idx].dosage = e.target.value;
                          setRecordForm({ ...recordForm, prescription: newPrescription });
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => {
                          const newPrescription = [...recordForm.prescription];
                          newPrescription[idx].duration = e.target.value;
                          setRecordForm({ ...recordForm, prescription: newPrescription });
                        }}
                      />
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addPrescriptionRow}>
                    + Add Medicine
                  </button>
                </div>

                <div className="form-group">
                  <label>Doctor Notes</label>
                  <textarea
                    value={recordForm.doctorNotes}
                    onChange={(e) => setRecordForm({ ...recordForm, doctorNotes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={recordForm.followUpDate}
                    onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-success">Create Medical Record</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
