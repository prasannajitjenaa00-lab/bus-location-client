import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Map, History, Bus, Users, Route as RouteIcon, 
  BarChart3, Settings, LogOut, Sun, Moon, ShieldCheck, ChevronRight,
  Menu, X
} from 'lucide-react';

import configEnv from '../config';

export default function AdminLayout({ children }) {
  const { admin, adminLogout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Tracking', path: '/admin/tracking', icon: Map },
    { name: 'Trip Playback', path: '/admin/playback', icon: History },
    { name: 'Bus Management', path: '/admin/buses', icon: Bus },
    { name: 'Driver Management', path: '/admin/drivers', icon: Users },
    { name: 'Route Management', path: '/admin/routes', icon: RouteIcon },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
              Dremonix Fleet
            </h1>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
              Enterprise SaaS
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Slide-over) */}
      <aside className={`
        fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-20
        w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col justify-between p-5 h-full md:h-screen
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo Branding (Desktop) */}
          <div className="hidden md:flex items-center space-x-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                Dremonix Fleet
              </h1>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                Enterprise SaaS
              </span>
            </div>
          </div>

          {/* Close button on mobile sidebar top */}
          <div className="md:hidden flex items-center justify-between px-2 pb-4 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Admin User */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:opacity-90 transition"
          >
            <div className="flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">
              {theme}
            </span>
          </button>

          {/* Admin User Info */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={admin?.avatar || configEnv.defaultAvatar}
                alt="Admin"
                className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0"
              />
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{admin?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{admin?.email || 'admin@fleet.com'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                adminLogout();
                navigate('/admin');
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

