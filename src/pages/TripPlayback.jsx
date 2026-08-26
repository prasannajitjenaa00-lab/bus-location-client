import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, Pause, RotateCcw, FastForward, Navigation, 
  Clock, Gauge, Calendar, Bus as BusIcon, Filter, Layers 
} from 'lucide-react';
import { motion } from 'framer-motion';

import configEnv from '../config';

const createAnimatedBusMarker = (speed = 1) => {
  return L.divIcon({
    className: 'trip-playback-bus-marker',
    html: `
      <div style="width: 38px; height: 38px; border-radius: 50%; background: #2563eb; border: 3px solid #fff; box-shadow: 0 0 15px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5C.1 13.2 0 13.6 0 14c0 .4.1.8.2 1.2C.5 16.3 2 18 2 18h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true });
  }, [center, map]);
  return null;
}

export default function TripPlayback() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Playback History data state
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation Playback Control State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2, 4

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await api.get('/buses');
      if (res.data.success) {
        setBuses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedBusId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadHistory = async () => {
    if (!selectedBusId) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentIndex(0);

    try {
      const res = await api.get(`/location/history?busId=${selectedBusId}&date=${selectedDate}`);
      if (res.data.success) {
        setHistoryData(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Playback Animation Interval Loop
  useEffect(() => {
    let timer;
    if (isPlaying && historyData.length > 0) {
      const intervalMs = Math.max(200, 1000 / playbackSpeed);
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= historyData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, historyData, playbackSpeed]);

  const polylinePositions = historyData.map(p => [p.lat, p.lng]);
  const currentPoint = historyData[currentIndex] || null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Controls Bar Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Google Timeline–Style Trip Playback</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Bus</label>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              >
                {buses.map(b => (
                  <option key={b._id} value={b._id}>{b.busNumber} ({b.registrationNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleLoadHistory}
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
              >
                {loading ? 'Fetching Historical GPS Trace...' : 'Load Trip Telemetry'}
              </button>
            </div>
          </div>
        </div>

        {/* Map & Timeline Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Playback Display */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 h-[500px] relative shadow-2xl">
            <MapContainer
              center={currentPoint ? [currentPoint.lat, currentPoint.lng] : [20.2961, 85.8245]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url={configEnv.mapTileUrl}
              />
              {currentPoint && <MapFlyTo center={[currentPoint.lat, currentPoint.lng]} />}

              {/* Full Traveled Path Polyline */}
              {polylinePositions.length > 0 && (
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
                />
              )}

              {/* Animated Current Bus Location */}
              {currentPoint && (
                <Marker
                  position={[currentPoint.lat, currentPoint.lng]}
                  icon={createAnimatedBusMarker(playbackSpeed)}
                />
              )}
            </MapContainer>

            {/* Floating Playback Controls Bar */}
            {historyData.length > 0 && (
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl z-[1000] flex flex-col gap-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button
                      onClick={() => { setIsPlaying(false); setCurrentIndex(0); }}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Timeline Slider */}
                  <input
                    type="range"
                    min="0"
                    max={historyData.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="flex-1 mx-4 accent-blue-500 cursor-pointer"
                  />

                  {/* Speed Multiplier Selectors */}
                  <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl">
                    {[0.5, 1, 2, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                          playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trip Summary Telemetry Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Trip Metrics & Telemetry</h3>

            {summary ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Total Distance</p>
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                    {summary.totalDistanceKm} km
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Avg Speed / Max Speed</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {summary.avgSpeedKmh} / {summary.maxSpeedKmh} km/h
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Duration & Points</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {summary.durationMin} minutes ({summary.totalPoints} GPS coordinates)
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select vehicle and date to inspect timeline playback.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
