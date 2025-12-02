import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Dashboard.css';

const PharmacistDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiredMeds, setExpiredMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const [drugForm, setDrugForm] = useState({
    drugName: '',
    batchNo: '',
    expiryDate: '',
    quantity: 0,
    threshold: 10,
    price: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, alertsRes, expiredRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/alerts'),
        api.get('/inventory/expired')
      ]);

      setInventory(invRes.data);
      setLowStockAlerts(alertsRes.data);
      setExpiredMeds(expiredRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', drugForm);
      setMessage('Drug added to inventory successfully!');
      setDrugForm({ drugName: '', batchNo: '', expiryDate: '', quantity: 0, threshold: 10, price: 0 });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding drug: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        setMessage('Item deleted successfully');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting item');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Pharmacist Dashboard</h1>
          <p>Manage your pharmacy inventory and stock</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p className="stat-number">{inventory.length}</p>
          </div>
          <div className="stat-card alert">
            <h3>Low Stock Alerts</h3>
            <p className="stat-number">{lowStockAlerts.length}</p>
          </div>
          <div className="stat-card danger">
            <h3>Expired Medicines</h3>
            <p className="stat-number">{expiredMeds.length}</p>
          </div>
          <div className="stat-card success">
            <h3>Total Value</h3>
            <p className="stat-number">
              ${inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'inventory' ? 'active' : ''} 
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button 
            className={activeTab === 'add' ? 'active' : ''} 
            onClick={() => setActiveTab('add')}
          >
            Add Drug
          </button>
          <button 
            className={activeTab === 'alerts' ? 'active' : ''} 
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
          </button>
        </div>

        {message && <div className="message success">{message}</div>}

        {activeTab === 'inventory' && (
          <div className="tab-content">
            <h2>Inventory List</h2>
            {inventory.length === 0 ? (
              <p>No items in inventory</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Drug Name</th>
                    <th>Batch No</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.drug_name}</td>
                      <td>{item.batch_no}</td>
                      <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>
                        {item.quantity <= item.threshold ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="tab-content">
            <h2>Add New Drug</h2>
            <form onSubmit={handleAddDrug} className="form">
              <div className="form-group">
                <label>Drug Name</label>
                <input
                  type="text"
                  value={drugForm.drugName}
                  onChange={(e) => setDrugForm({ ...drugForm, drugName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Batch Number</label>
                <input
                  type="text"
                  value={drugForm.batchNo}
                  onChange={(e) => setDrugForm({ ...drugForm, batchNo: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={drugForm.expiryDate}
                  onChange={(e) => setDrugForm({ ...drugForm, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={drugForm.quantity}
                  onChange={(e) => setDrugForm({ ...drugForm, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  value={drugForm.threshold}
                  onChange={(e) => setDrugForm({ ...drugForm, threshold: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Price per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  value={drugForm.price}
                  onChange={(e) => setDrugForm({ ...drugForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Add Drug</button>
            </form>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="tab-content">
            <h2>Stock Alerts</h2>
            
            <h3>Low Stock Items</h3>
            {lowStockAlerts.length === 0 ? (
              <p>No low stock alerts</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Drug Name</th>
                    <th>Current Qty</th>
                    <th>Threshold</th>
                    <th>Action Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockAlerts.map(item => (
                    <tr key={item.id}>
                      <td>{item.drug_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.threshold}</td>
                      <td><span className="badge badge-warning">Restock Required</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3 style={{marginTop: '30px'}}>Expired Medicines</h3>
            {expiredMeds.length === 0 ? (
              <p>No expired medicines</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Drug Name</th>
                    <th>Batch No</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredMeds.map(item => (
                    <tr key={item.id}>
                      <td>{item.drug_name}</td>
                      <td>{item.batch_no}</td>
                      <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
