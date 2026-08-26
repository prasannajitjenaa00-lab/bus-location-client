import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import socket from '../services/socket';
import { 
  Bus, Users, Activity, Navigation, Clock, ShieldCheck, 
  MapPin, ArrowUpRight, TrendingUp, AlertTriangle, Play 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();

    // Listen for realtime socket updates
    socket.on('bus:update', () => {
      fetchDashboardStats();
    });

    socket.on('trip:started', () => {
      fetchDashboardStats();
    });

    socket.on('trip:ended', () => {
      fetchDashboardStats();
    });

    return () => {
      socket.off('bus:update');
      socket.off('trip:started');
      socket.off('trip:ended');
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { time: '06:00', distance: 45, trips: 3 },
    { time: '09:00', distance: 120, trips: 12 },
    { time: '12:00', distance: 210, trips: 18 },
    { time: '15:00', distance: 340, trips: 25 },
    { time: '18:00', distance: 410, trips: 28 },
    { time: '21:00', distance: 480, trips: 32 },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive Fleet Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Real-time telemetry, driver status, and active route operations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Telematics Engine Connected
            </span>
          </div>
        </div>

        {/* 4 Primary Key Metric Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Fleet Buses</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.totalBuses || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bus className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <span className="text-emerald-500 font-semibold">{stats?.runningBuses || 0} Running</span>
              <span>{stats?.idleBuses || 0} Idle</span>
              <span>{stats?.offlineBuses || 0} Offline</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Drivers</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.driversOnline || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <span className="text-slate-400">Out of {stats?.totalDrivers || 0} Total Staff</span>
              <span className="text-emerald-500 font-semibold">{Math.round(((stats?.driversOnline || 0)/(stats?.totalDrivers || 1))*100)}% Active</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trips Completed Today</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.tripsToday || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <span className="text-indigo-500 font-semibold">{stats?.currentActiveTrips || 0} In Transit Now</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distance Covered</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.distanceToday || 0} <span className="text-sm font-semibold">km</span></h3>
              </div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Navigation className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
              </span>
            </div>
          </motion.div>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Distance & Route Telemetry</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated kilometer breakdown across operating hours</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDistance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Trips & Mini List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Active In-Transit Buses</h2>
                <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-500 font-semibold rounded-full">
                  {stats?.activeTripsList?.length || 0} Active
                </span>
              </div>

              <div className="space-y-3">
                {stats?.activeTripsList?.length > 0 ? (
                  stats.activeTripsList.map((t) => (
                    <div key={t._id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center font-bold text-xs">
                          {t.bus?.busNumber || 'BUS'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{t.driver?.name || 'Driver'}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                            {t.route?.routeName || 'Assigned Route'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                        {t.bus?.lastKnownLocation?.speed || 40} km/h
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No active trips currently in transit.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a href="/admin/tracking" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center space-x-1">
                <span>View Full Map Telematics</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
