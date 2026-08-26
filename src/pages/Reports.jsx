import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../services/api';
import { BarChart3, Download, Calendar, Filter, FileText, CheckCircle } from 'lucide-react';

export default function Reports() {
  const [timeframe, setTimeframe] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?timeframe=${timeframe}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.trips) return;
    const headers = ["Trip ID", "Bus", "Driver", "Route", "Distance (km)", "Status", "Start Time"];
    const rows = reportData.trips.map(t => [
      t._id,
      t.bus?.busNumber || 'N/A',
      t.driver?.name || 'N/A',
      t.route?.routeName || 'N/A',
      t.totalDistanceKm || 0,
      t.status,
      new Date(t.startTime).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_report_${timeframe}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Telemetry Audit</h1>
            <p className="text-xs text-slate-500 mt-1">Export bus performance, driver distance & trip summaries</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 dark:text-white"
            >
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Aggregate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Executed Trips</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {reportData?.summary?.totalTrips || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Fleet Distance</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {reportData?.summary?.totalDistanceKm || 0} km
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl">
            <p className="text-xs text-slate-400 font-semibold uppercase">Completed Ratio</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-1">
              {reportData?.summary?.completedTrips || 0} / {reportData?.summary?.totalTrips || 0}
            </p>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="p-4">Bus</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Route</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Start Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {reportData?.trips?.map((t) => (
                <tr key={t._id}>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{t.bus?.busNumber || 'BUS'}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{t.driver?.name || 'Driver'}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{t.route?.routeName || 'Route'}</td>
                  <td className="p-4 font-mono font-bold text-blue-500">{t.totalDistanceKm || 0} km</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {new Date(t.startTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
