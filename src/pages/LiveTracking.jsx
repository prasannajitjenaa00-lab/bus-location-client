import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import socket from '../services/socket';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Filter, Maximize2, Minimize2, Navigation, 
  Wifi, Battery, ShieldAlert, Zap, Bus as BusIcon, RefreshCw, X, MapPin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import configEnv from '../config';

// Custom Animated Leaflet SVG Bus Marker Creation
const createCustomBusIcon = (color = '#3b82f6', isSelected = false) => {
  return L.divIcon({
    className: 'custom-bus-marker-container',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; items-center: justify-center;">
        ${isSelected ? `<div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: 40px; 
          height: 40px; 
          border-radius: 12px; 
          background: ${color}; 
          border: 3px solid white; 
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: white;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.3s ease;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/>
            <path d="M15 6v6"/>
            <path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5C.1 13.2 0 13.6 0 14c0 .4.1.8.2 1.2C.5 16.3 2 18 2 18h3"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

// Map helper to center on bus click
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LiveTracking() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapCenter, setMapCenter] = useState([20.2961, 85.8245]); // Default Bhubaneswar HQ

  useEffect(() => {
    fetchLiveBuses();

    // Socket Realtime Location Stream Listener
    socket.on('bus:update', (data) => {
      setBuses((prevBuses) =>
        prevBuses.map((b) => {
          if (b._id === data.busId || b.busNumber === data.busId) {
            const updated = {
              ...b,
              status: data.speed > 2 ? 'Running' : 'Idle',
              lastKnownLocation: {
                lat: data.lat,
                lng: data.lng,
                speed: data.speed,
                heading: data.heading || 0,
                address: data.address || b.lastKnownLocation?.address,
                lastUpdated: new Date()
              }
            };
            if (selectedBus && selectedBus._id === b._id) {
              setSelectedBus(updated);
            }
            return updated;
          }
          return b;
        })
      );
    });

    return () => {
      socket.off('bus:update');
    };
  }, [selectedBus]);

  const fetchLiveBuses = async () => {
    try {
      const res = await api.get('/location/live');
      if (res.data.success) {
        setBuses(res.data.data);
        if (res.data.data.length > 0 && !selectedBus) {
          const firstBus = res.data.data[0];
          setSelectedBus(firstBus);
          if (firstBus.lastKnownLocation?.lat) {
            setMapCenter([firstBus.lastKnownLocation.lat, firstBus.lastKnownLocation.lng]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBuses = buses.filter((b) => {
    const matchesSearch =
      b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.assignedDriver?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.assignedRoute?.routeName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running': return '#10b981'; // Emerald
      case 'Idle': return '#f59e0b'; // Amber
      case 'Maintenance': return '#ef4444'; // Red
      default: return '#64748b'; // Slate
    }
  };

  return (
    <AdminLayout>
      <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : 'relative'}`}>
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bus #, Driver, or Route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Running', 'Idle', 'Offline', 'Maintenance'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                showRoutes 
                  ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/40' 
                  : 'border-slate-300 dark:border-slate-700 text-slate-500'
              }`}
            >
              Polylines: {showRoutes ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
              title="Toggle Fullscreen Map"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map & Floating Telemetry Card Container */}
        <div className="relative w-full h-[calc(100vh-220px)] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Leaflet OpenStreetMap Container */}
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={configEnv.mapTileUrl}
            />

            <MapRecenter center={mapCenter} />

            {/* Display Colored Route Polylines */}
            {showRoutes && filteredBuses.map((bus) => {
              if (!bus.assignedRoute?.waypoints) return null;
              const points = bus.assignedRoute.waypoints.map(w => [w.lat, w.lng]);
              return (
                <Polyline
                  key={`poly-${bus._id}`}
                  positions={points}
                  pathOptions={{
                    color: bus.assignedRoute.color || '#3b82f6',
                    weight: selectedBus?._id === bus._id ? 6 : 3,
                    opacity: selectedBus?._id === bus._id ? 0.9 : 0.4,
                    dashArray: '8, 8'
                  }}
                />
              );
            })}

            {/* Bus Markers */}
            {filteredBuses.map((bus) => {
              const lat = bus.lastKnownLocation?.lat || 20.2961;
              const lng = bus.lastKnownLocation?.lng || 85.8245;
              const isSelected = selectedBus?._id === bus._id;

              return (
                <Marker
                  key={bus._id}
                  position={[lat, lng]}
                  icon={createCustomBusIcon(getStatusColor(bus.status), isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedBus(bus);
                      setMapCenter([lat, lng]);
                    }
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1">
                      <p className="font-bold text-sm text-slate-900">{bus.busNumber}</p>
                      <p className="text-xs text-slate-600">{bus.assignedDriver?.name || 'Unassigned'}</p>
                      <p className="text-[11px] text-blue-600 font-semibold mt-1">{bus.lastKnownLocation?.speed || 0} km/h</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Live Telemetry Info Card */}
          <AnimatePresence>
            {selectedBus && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:bottom-auto sm:top-4 sm:right-4 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl z-[1000] text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(selectedBus.status) }}
                    >
                      <BusIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate">{selectedBus.busNumber}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedBus.model}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBus(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 sm:py-4 text-xs border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Driver</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {selectedBus.assignedDriver?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Route</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {selectedBus.assignedRoute?.routeName || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Live Speed</span>
                    <span className="font-bold font-mono text-emerald-500 text-sm">
                      {selectedBus.lastKnownLocation?.speed || 0} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
                    <span className="font-bold px-2 py-0.5 rounded-full text-[10px] inline-block" style={{ backgroundColor: `${getStatusColor(selectedBus.status)}20`, color: getStatusColor(selectedBus.status) }}>
                      {selectedBus.status}
                    </span>
                  </div>
                </div>

                <div className="pt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 flex-shrink-0"><MapPin className="w-3.5 h-3.5 text-blue-500" /> Address:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                      {selectedBus.lastKnownLocation?.address || 'Depot'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 flex-shrink-0"><Wifi className="w-3.5 h-3.5 text-emerald-500" /> Lat / Lng:</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {selectedBus.lastKnownLocation?.lat?.toFixed(4)}, {selectedBus.lastKnownLocation?.lng?.toFixed(4)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
