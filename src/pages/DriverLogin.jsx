import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bus, Shield, Key, UserCheck, ArrowRight, Activity, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DriverLogin() {
  const [employeeId, setEmployeeId] = useState('DRV-1001');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { driverLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await driverLogin(employeeId, password);
      toast.success('Welcome back, Driver!');
      navigate('/driver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center relative overflow-hidden px-4">
      {/* Background Animated Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Driver Telematics Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Dremonix Enterprise Fleet Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Employee ID
            </label>
            <div className="relative">
              <UserCheck className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. DRV-1001"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Key className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In To Console'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Session</span>
          </div>
          <button 
            onClick={() => navigate('/admin')}
            className="text-blue-400 hover:underline font-medium"
          >
            Admin Access →
          </button>
        </div>
      </motion.div>

      {/* Demo helper pill */}
      <div className="mt-6 text-xs text-slate-500 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
        Demo Account: <span className="text-blue-400 font-mono">DRV-1001</span> | Pass: <span className="text-blue-400 font-mono">password123</span>
      </div>
    </div>
  );
}
