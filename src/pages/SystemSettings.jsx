import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Bell, Moon, Sun, Building, Lock } from 'lucide-react';

export default function SystemSettings() {
  const { admin, theme, toggleTheme } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings & Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">Configure company profiles, security thresholds, and appearance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-500" /> Enterprise Organization Profile
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Company Name</label>
              <input
                type="text" defaultValue={admin?.companyName || "Dremonix Metro Express Fleet"}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Admin Email</label>
              <input
                type="email" defaultValue={admin?.email || "admin@fleet.com"} disabled
                className="w-full bg-slate-100 dark:bg-slate-800 border-none p-3 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" /> UI Theme Preference
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Toggle between Dark Glassmorphism Mode and Light SaaS Mode</span>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-xs"
            >
              Current: {theme.toUpperCase()} MODE
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
