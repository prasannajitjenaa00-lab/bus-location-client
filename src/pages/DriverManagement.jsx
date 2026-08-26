import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Search, Edit3, Trash2, ShieldCheck, X, Phone, Key } from 'lucide-react';

import configEnv from '../config';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    password: 'password123',
    phone: '',
    licenseNumber: '',
    status: 'Offline'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      if (res.data.success) setDrivers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver._id}`, formData);
        toast.success('Driver updated successfully!');
      } else {
        await api.post('/drivers', formData);
        toast.success('New Driver registered successfully!');
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete driver record?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success('Driver removed');
      fetchDrivers();
    } catch (err) {
      toast.error('Failed to delete driver');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Personnel Operations</h1>
            <p className="text-xs text-slate-500 mt-1">Manage licensed bus operators, credentials, and live statuses</p>
          </div>

          <button
            onClick={() => {
              setEditingDriver(null);
              setFormData({ name: '', employeeId: '', password: 'password123', phone: '', licenseNumber: '', status: 'Offline' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Driver</span>
          </button>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((drv) => (
            <div key={drv._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={drv.photo || configEnv.defaultAvatar}
                  alt={drv.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{drv.name}</h3>
                  <span className="text-xs font-mono font-semibold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md">
                    {drv.employeeId}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Phone:</span> {drv.phone}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">License #:</span> {drv.licenseNumber}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">Assigned Bus:</span> {drv.assignedBus?.busNumber || 'None'}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  drv.status === 'On Trip' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                }`}>
                  {drv.status}
                </span>

                <div className="space-x-1">
                  <button onClick={() => handleDelete(drv._id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Register New Driver</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Driver Full Name</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rajesh Kumar" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Employee ID</label>
                    <input
                      type="text" required value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="DRV-1004" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Password</label>
                    <input
                      type="password" required value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                    <input
                      type="text" required value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">License Number</label>
                    <input
                      type="text" required value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="DL-2024-XXXX" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4">
                  Create Driver Account
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
