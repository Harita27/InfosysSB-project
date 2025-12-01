import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: []
  });

  // Symptom form state
  const [symptomForm, setSymptomForm] = useState({
    description: '',
    severity: 'mild'
  });

  // Medical history form state
  const [historyForm, setHistoryForm] = useState({
    condition: '',
    diagnosedDate: '',
    notes: ''
  });

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [profileRes, doctorsRes, appointmentsRes, recordsRes] = await Promise.all([
        api.get('/patients/profile'),
        api.get('/patients/doctors'),
        api.get('/appointments'),
        api.get('/medical-records')
      ]);

      setProfile(profileRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
      setMedicalRecords(recordsRes.data);

      setProfileForm({
        dateOfBirth: profileRes.data.dateOfBirth ? new Date(profileRes.data.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileRes.data.gender || '',
        bloodGroup: profileRes.data.bloodGroup || '',
        allergies: profileRes.data.allergies || []
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/patients/profile', profileForm);
      setMessage('Profile updated successfully!');
      fetchPatientData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients/symptoms', symptomForm);
      setMessage('Symptom added successfully!');
      setSymptomForm({ description: '', severity: 'mild' });
      fetchPatientData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding symptom');
    }
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients/medical-history', historyForm);
      setMessage('Medical history added successfully!');
      setHistoryForm({ condition: '', diagnosedDate: '', notes: '' });
      fetchPatientData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding medical history');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', appointmentForm);
      setMessage('Appointment booked successfully!');
      setAppointmentForm({ doctorId: '', appointmentDate: '', reason: '' });
      fetchPatientData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error booking appointment');
    }
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
            className={activeTab === 'symptoms' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('symptoms')}
          >
            🩺 Symptoms
          </button>
          <button 
            className={activeTab === 'history' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('history')}
          >
            📖 Medical History
          </button>
          <button 
            className={activeTab === 'doctors' ? 'sidebar-btn active' : 'sidebar-btn'}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Find Doctors
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
        </div>

        <div className="dashboard-content">
          {message && <div className="alert success">{message}</div>}

          {activeTab === 'profile' && (
            <div className="card">
              <h2>Patient Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={profileForm.allergies.join(', ')}
                    onChange={(e) => setProfileForm({ 
                      ...profileForm, 
                      allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                    })}
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </div>

                <button type="submit" className="btn btn-primary">Update Profile</button>
              </form>
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div>
              <div className="card">
                <h2>Add New Symptom</h2>
                <form onSubmit={handleAddSymptom}>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={symptomForm.description}
                      onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                      required
                      placeholder="Describe your symptoms..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      value={symptomForm.severity}
                      onChange={(e) => setSymptomForm({ ...symptomForm, severity: e.target.value })}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-success">Add Symptom</button>
                </form>
              </div>

              <div className="card">
                <h2>My Symptoms</h2>
                {profile?.symptoms?.length === 0 ? (
                  <p>No symptoms recorded yet.</p>
                ) : (
                  <div className="symptoms-list">
                    {profile?.symptoms?.map((symptom, idx) => (
                      <div key={idx} className="symptom-item">
                        <div>
                          <strong>{symptom.description}</strong>
                          <span className={`badge badge-${symptom.severity === 'severe' ? 'danger' : symptom.severity === 'moderate' ? 'warning' : 'info'}`}>
                            {symptom.severity}
                          </span>
                        </div>
                        <small>{new Date(symptom.date).toLocaleDateString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="card">
                <h2>Add Medical History</h2>
                <form onSubmit={handleAddHistory}>
                  <div className="form-group">
                    <label>Condition</label>
                    <input
                      type="text"
                      value={historyForm.condition}
                      onChange={(e) => setHistoryForm({ ...historyForm, condition: e.target.value })}
                      required
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                  </div>

                  <div className="form-group">
                    <label>Diagnosed Date</label>
                    <input
                      type="date"
                      value={historyForm.diagnosedDate}
                      onChange={(e) => setHistoryForm({ ...historyForm, diagnosedDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={historyForm.notes}
                      onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })}
                      placeholder="Additional information..."
                    />
                  </div>

                  <button type="submit" className="btn btn-success">Add to History</button>
                </form>
              </div>

              <div className="card">
                <h2>Medical History</h2>
                {profile?.medicalHistory?.length === 0 ? (
                  <p>No medical history recorded yet.</p>
                ) : (
                  <div className="history-list">
                    {profile?.medicalHistory?.map((item, idx) => (
                      <div key={idx} className="history-item">
                        <h3>{item.condition}</h3>
                        <p><strong>Diagnosed:</strong> {new Date(item.diagnosedDate).toLocaleDateString()}</p>
                        <p>{item.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div>
              <div className="card">
                <h2>Book Appointment</h2>
                <form onSubmit={handleBookAppointment}>
                  <div className="form-group">
                    <label>Select Doctor</label>
                    <select
                      value={appointmentForm.doctorId}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorId: e.target.value })}
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Appointment Date & Time</label>
                    <input
                      type="datetime-local"
                      value={appointmentForm.appointmentDate}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reason for Visit</label>
                    <textarea
                      value={appointmentForm.reason}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                      required
                      placeholder="Why do you need to see the doctor?"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Book Appointment</button>
                </form>
              </div>

              <div className="card">
                <h2>Available Doctors ({doctors.length})</h2>
                {doctors.length === 0 ? (
                  <p>No doctors available at the moment.</p>
                ) : (
                  <div className="doctors-grid">
                    {doctors.map((doctor) => (
                      <div key={doctor._id} className="doctor-card">
                        <h3>Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}</h3>
                        <p><strong>Specialization:</strong> {doctor.specialization}</p>
                        <p><strong>Experience:</strong> {doctor.experience} years</p>
                        <p><strong>Fee:</strong> ${doctor.consultationFee}</p>
                        <p>{doctor.description}</p>
                        <span className={`badge badge-${doctor.availability === 'Available' ? 'success' : 'warning'}`}>
                          {doctor.availability}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="card">
              <h2>My Appointments</h2>
              {appointments.length === 0 ? (
                <p>No appointments scheduled.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt._id}>
                        <td>Dr. {apt.doctor?.userId?.firstName} {apt.doctor?.userId?.lastName}</td>
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
              <h2>My Medical Records</h2>
              {medicalRecords.length === 0 ? (
                <p>No medical records yet.</p>
              ) : (
                <div className="records-list">
                  {medicalRecords.map((record) => (
                    <div key={record._id} className="record-item">
                      <h3>Consultation with Dr. {record.doctor?.userId?.firstName} {record.doctor?.userId?.lastName}</h3>
                      <p><strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}</p>
                      <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                      <p><strong>Doctor's Notes:</strong> {record.doctorNotes}</p>
                      {record.prescription.length > 0 && (
                        <div className="prescription-box">
                          <strong>Prescription:</strong>
                          <ul>
                            {record.prescription.map((med, idx) => (
                              <li key={idx}>
                                <strong>{med.medicine}</strong> - {med.dosage} for {med.duration}
                                {med.instructions && <><br /><em>{med.instructions}</em></>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.followUpDate && (
                        <p><strong>Follow-up:</strong> {new Date(record.followUpDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
