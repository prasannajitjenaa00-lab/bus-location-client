import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';
import { 
  Play, Square, Navigation, BatteryCharging, Wifi, 
  MapPin, Clock, Gauge, Bus, ShieldAlert, LogOut, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import configEnv from '../config';

export default function DriverConsole() {
  const { driver, driverLogout, setDriver } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  
  // Realtime Telemetry Simulation state
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentCoords, setCurrentCoords] = useState({ lat: 20.3150, lng: 85.8450 });

  useEffect(() => {
    fetchActiveTrip();
    fetchBusesAndRoutes();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      const res = await api.get('/trip/active');
      if (res.data.success && res.data.data) {
        setActiveTrip(res.data.data);
        setIsGpsActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBusesAndRoutes = async () => {
    try {
      const busRes = await api.get('/buses');
      const routeRes = await api.get('/routes');
      if (busRes.data.success) setBuses(busRes.data.data);
      if (routeRes.data.success) setRoutes(routeRes.data.data);
      
      if (driver?.assignedBus) setSelectedBusId(driver.assignedBus._id || driver.assignedBus);
      if (driver?.assignedRoute) setSelectedRouteId(driver.assignedRoute._id || driver.assignedRoute);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate real distance in km between two lat/lng points using Haversine formula
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Reverse geocode real lat/lng to street address using Nominatim
  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(`${configEnv.geocodingUrl}?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(', ');
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  };

  // Real Device HTML5 Geolocation API Integration
  useEffect(() => {
    let watchId;
    let lastPosition = null;
    let lastTime = null;

    if (isGpsActive && activeTrip) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude, speed: rawSpeed, heading: rawHeading, accuracy } = position.coords;
            const now = Date.now();

            let calculatedSpeedKmh = 0;

            if (rawSpeed !== null && rawSpeed !== undefined && !isNaN(rawSpeed)) {
              // Convert m/s to km/h directly from device GPS sensor
              calculatedSpeedKmh = Math.round(rawSpeed * 3.6);
            } else if (lastPosition && lastTime) {
              // Derive real speed from delta distance over delta time
              const distKm = calculateHaversineDistance(lastPosition.lat, lastPosition.lng, latitude, longitude);
              const timeSec = (now - lastTime) / 1000;
              if (timeSec > 0) {
                calculatedSpeedKmh = Math.round((distKm / timeSec) * 3600);
              }
            }

            // Accumulate actual traveled distance
            if (lastPosition) {
              const deltaDist = calculateHaversineDistance(lastPosition.lat, lastPosition.lng, latitude, longitude);
              setDistanceKm(prev => Math.round((prev + deltaDist) * 100) / 100);
            }

            lastPosition = { lat: latitude, lng: longitude };
            lastTime = now;

            setCurrentCoords({ lat: latitude, lng: longitude });
            setCurrentSpeed(calculatedSpeedKmh);

            const liveAddress = await fetchAddressFromCoords(latitude, longitude);
            const busId = activeTrip.bus?._id || activeTrip.bus || selectedBusId;

            try {
              await api.post('/location/update', {
                busId,
                tripId: activeTrip._id,
                lat: latitude,
                lng: longitude,
                speed: calculatedSpeedKmh,
                heading: rawHeading || 0,
                accuracy: accuracy || 5,
                batteryLevel,
                address: liveAddress
              });

              socket.emit('location:update', {
                busId,
                driverId: driver._id,
                tripId: activeTrip._id,
                lat: latitude,
                lng: longitude,
                speed: calculatedSpeedKmh,
                heading: rawHeading || 0,
                address: liveAddress,
                timestamp: new Date()
              });
            } catch (err) {
              console.error('Location sync error:', err);
            }
          },
          (error) => {
            console.warn('Geolocation sensor error:', error.message);
            toast.error(`GPS Error: ${error.message}`);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isGpsActive, activeTrip, selectedBusId]);

  // Duration timer
  useEffect(() => {
    let timer;
    if (isGpsActive && activeTrip) {
      timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isGpsActive, activeTrip]);

  const handleStartTrip = async () => {
    let locationGranted = false;

    // Force explicit location permission verification
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              toast.success('Location permission verified!');
              resolve(pos);
            },
            (err) => {
              console.warn('Geolocation error:', err.message);
              toast.error('Location permission is REQUIRED to start a trip. Please enable GPS in browser permissions.');
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });

        if (position) {
          locationGranted = true;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      toast.error('Geolocation is not supported by this device.');
      return;
    }

    // Stop execution if location permission was not granted
    if (!locationGranted) {
      return;
    }

    try {
      const res = await api.post('/trip/start', {
        busId: selectedBusId || (driver.assignedBus?._id || driver.assignedBus),
        routeId: selectedRouteId || (driver.assignedRoute?._id || driver.assignedRoute)
      });
      if (res.data.success) {
        setActiveTrip(res.data.data);
        setIsGpsActive(true);
        setElapsedSeconds(0);
        setDistanceKm(0);
        toast.success('Trip Started! Live Device GPS Telemetry Active.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start trip');
    }
  };

  const handleEndTrip = async () => {
    try {
      const res = await api.post('/trip/end');
      if (res.data.success) {
        setActiveTrip(null);
        setIsGpsActive(false);
        toast.success('Trip Ended Successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not end trip');
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 select-none max-w-md mx-auto relative overflow-hidden">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src={driver?.photo || configEnv.defaultAvatar}
            alt={driver?.name} 
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
          />
          <div>
            <h2 className="font-bold text-lg text-white leading-tight">{driver?.name || 'Driver Console'}</h2>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                {driver?.employeeId}
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={driverLogout}
          className="p-3 bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-2xl transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Vehicle & Route Assignment Selectors (If not pre-assigned) */}
      {!activeTrip && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl mb-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trip Configuration</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Assigned Bus</label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Bus --</option>
              {buses.map(b => (
                <option key={b._id} value={b._id}>{b.busNumber} - {b.model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Route</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Route --</option>
              {routes.map(r => (
                <option key={r._id} value={r._id}>{r.routeName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Telemetry Status Bar Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-5 h-5 ${isGpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">GPS Telematics</p>
              <p className={`text-xs font-bold ${isGpsActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isGpsActive ? 'ACTIVE (5s Sync)' : 'OFFLINE'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Phone Battery</p>
              <p className="text-xs font-bold text-slate-200">{batteryLevel}% Charging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Trip Dashboard Telemetry (Visible when Trip Active) */}
      {activeTrip && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-slate-950 border border-blue-500/30 p-6 rounded-3xl mb-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Trip In Progress</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">ID: {activeTrip._id?.slice(-6)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Duration</p>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{formatTimer(elapsedSeconds)}</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Live Speed</p>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{currentSpeed} km/h</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <Navigation className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Distance</p>
              <p className="text-sm font-mono font-bold text-white mt-0.5">{distanceKm} km</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Large Action Button */}
      <div className="mt-auto pt-4">
        {!activeTrip ? (
          <button
            onClick={handleStartTrip}
            className="w-full py-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xl rounded-3xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center space-x-3 transition-all transform active:scale-95"
          >
            <Play className="w-8 h-8 fill-current" />
            <span>START TRIP</span>
          </button>
        ) : (
          <button
            onClick={handleEndTrip}
            className="w-full py-6 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xl rounded-3xl shadow-2xl shadow-red-500/30 flex items-center justify-center space-x-3 transition-all transform active:scale-95"
          >
            <Square className="w-8 h-8 fill-current" />
            <span>END TRIP</span>
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-slate-500">
          Background GPS tracking auto-runs while trip is active.
        </p>
      </div>
    </div>
  );
}
