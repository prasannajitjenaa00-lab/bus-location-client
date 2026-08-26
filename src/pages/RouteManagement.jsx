import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Route as RouteIcon, Plus, Trash2, Edit3, MapPin, Clock, Navigation, X } from 'lucide-react';

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    routeName: '',
    startingPoint: '',
    endingPoint: '',
    distanceKm: 20,
    estimatedTimeMin: 40,
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      if (res.data.success) setRoutes(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/routes', formData);
      toast.success('Route created successfully!');
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err) {
      toast.error('Failed to create route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      toast.success('Route deleted');
      fetchRoutes();
    } catch (err) {
      toast.error('Failed to delete route');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Route Network Management</h1>
            <p className="text-xs text-slate-500 mt-1">Configure transit corridors, waypoints, distance and color codes</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Route</span>
          </button>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((rt) => (
            <div key={rt._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-10 rounded-full" style={{ backgroundColor: rt.color || '#3b82f6' }}></div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{rt.routeName}</h3>
                  <p className="text-xs text-slate-400">{rt.startingPoint} → {rt.endingPoint}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div>
                  <span className="block text-[10px] uppercase font-semibold">Distance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{rt.distanceKm} km</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold">Est. Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{rt.estimatedTimeMin} min</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => handleDelete(rt._id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Route</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Route Name</label>
                  <input
                    type="text" required value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    placeholder="Route 404 - Express Corridor" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Starting Point</label>
                    <input
                      type="text" required value={formData.startingPoint}
                      onChange={(e) => setFormData({ ...formData, startingPoint: e.target.value })}
                      placeholder="Central Hub" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Ending Point</label>
                    <input
                      type="text" required value={formData.endingPoint}
                      onChange={(e) => setFormData({ ...formData, endingPoint: e.target.value })}
                      placeholder="Airport T2" className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4">
                  Save Route Corridor
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
