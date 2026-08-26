import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bus as BusIcon, Plus, Search, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [formData, setFormData] = useState({
    busNumber: '',
    registrationNumber: '',
    model: '',
    capacity: 50,
    assignedDriver: '',
    assignedRoute: '',
    status: 'Offline'
  });

  useEffect(() => {
    fetchBuses();
    fetchDriversAndRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await api.get('/buses');
      if (res.data.success) setBuses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDriversAndRoutes = async () => {
    try {
      const drvRes = await api.get('/drivers');
      const rtRes = await api.get('/routes');
      if (drvRes.data.success) setDrivers(drvRes.data.data);
      if (rtRes.data.success) setRoutes(rtRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await api.put(`/buses/${editingBus._id}`, formData);
        toast.success('Bus details updated successfully!');
      } else {
        await api.post('/buses', formData);
        toast.success('New Bus added to fleet!');
      }
      setIsModalOpen(false);
      fetchBuses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/buses/${id}`);
      toast.success('Bus deleted');
      fetchBuses();
    } catch (err) {
      toast.error('Failed to delete bus');
    }
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      model: bus.model,
      capacity: bus.capacity,
      assignedDriver: bus.assignedDriver?._id || '',
      assignedRoute: bus.assignedRoute?._id || '',
      status: bus.status
    });
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bus Fleet Management</h1>
            <p className="text-xs text-slate-500 mt-1">Manage vehicles, specs, assigned drivers and routes</p>
          </div>

          <button
            onClick={() => {
              setEditingBus(null);
              setFormData({ busNumber: '', registrationNumber: '', model: '', capacity: 50, assignedDriver: '', assignedRoute: '', status: 'Offline' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="p-4">Bus # / Reg</th>
                <th className="p-4">Model & Capacity</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Assigned Route</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {buses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{bus.busNumber}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{bus.registrationNumber}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{bus.model}</p>
                    <p className="text-[11px] text-slate-400">{bus.capacity} Seats</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {bus.assignedDriver?.name || 'Unassigned'}
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {bus.assignedRoute?.routeName || 'Unassigned'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      bus.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500' :
                      bus.status === 'Idle' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(bus)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(bus._id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit / Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bus Number</label>
                  <input
                    type="text" required value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    placeholder="BUS-105" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Registration Number</label>
                  <input
                    type="text" required value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="OD-02-AX-9999" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Model</label>
                    <input
                      type="text" required value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Volvo B11R" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Capacity</label>
                    <input
                      type="number" required value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4">
                  Save Vehicle Details
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
