import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, Battery, Signal, AlertTriangle, Play, Pause, RotateCcw, Map, Users, Wifi } from 'lucide-react';

export default function DroneFleet() {
  const [drones, setDrones] = useState({
    "GUARD-01": { drone_id: "GUARD-01", lat: 28.7041, lon: 77.1025, alt: 120.4, battery: 78, status: "active", detection: "Clear", confidence: 0.0 },
    "GUARD-02": { drone_id: "GUARD-02", lat: 28.7055, lon: 77.1100, alt: 95.1, battery: 72, status: "active", detection: "Human", confidence: 0.85 },
    "GUARD-03": { drone_id: "GUARD-03", lat: 28.7000, lon: 77.1000, alt: 140.0, battery: 45, status: "inactive", detection: "Clear", confidence: 0.0 },
    "GUARD-04": { drone_id: "GUARD-04", lat: 28.7020, lon: 77.0950, alt: 80.0, battery: 91, status: "active", detection: "Human", confidence: 0.92 },
    "GUARD-05": { drone_id: "GUARD-05", lat: 28.7070, lon: 77.1080, alt: 60.0, battery: 34, status: "maintenance", detection: "Unknown", confidence: 0.0 }
  });
  const [selected, setSelected] = useState(null);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionForm, setMissionForm] = useState({
    droneId: '',
    area: ''
  });

  const areas = [
    'Delhi NCR - Sector 1',
    'Delhi NCR - Sector 2', 
    'Delhi NCR - Sector 3',
    'Gurgaon Industrial Area',
    'Noida Tech Park',
    'Border Patrol Zone A',
    'Border Patrol Zone B'
  ];

  const handleMissionSubmit = (e) => {
    e.preventDefault();
    if (!missionForm.droneId || !missionForm.area) {
      alert('Please select both drone and area!');
      return;
    }
    
    // Update drone status to active
    setDrones(prev => ({
      ...prev,
      [missionForm.droneId]: {
        ...prev[missionForm.droneId],
        status: 'active'
      }
    }));
    
    console.log('Mission Activated:', missionForm);
    alert(`Mission activated! ${missionForm.droneId} deployed to ${missionForm.area}`);
    
    // Reset form and close modal
    setMissionForm({ droneId: '', area: '' });
    setShowMissionModal(false);
  };

  useEffect(() => {
    async function fetchSwarmDetections() {
      try {
        const res = await fetch("http://localhost:8000/api/detections/swarm");
        const data = await res.json();
        
        setDrones(prev => {
          const updated = { ...prev };
          Object.keys(data).forEach(droneId => {
            if (updated[droneId]) {
              updated[droneId] = {
                ...updated[droneId],
                detection: data[droneId].detection,
                confidence: data[droneId].confidence
              };
            }
          });
          return updated;
        });
      } catch (err) {
        console.error("Swarm detection fetch failed:", err);
      }
    }

    fetchSwarmDetections();
    const interval = setInterval(fetchSwarmDetections, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-emerald-400';
      case 'inactive': return 'text-slate-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 50) return 'bg-emerald-400';
    if (battery > 20) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const activeCount = Object.values(drones).filter(d => d.status === 'active').length;
  const avgBattery = Math.round(Object.values(drones).reduce((acc, d) => acc + d.battery, 0) / Object.values(drones).length);

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-700 rounded-lg flex items-center justify-center text-black font-bold">
            🚁
          </div>
          <div>
            <h1 className="text-lg font-semibold">Guard-X Swarm Control</h1>
            <p className="text-xs text-slate-400">Live swarm monitoring · Operator: Field Command</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">
            Status: <span className="text-emerald-400">All systems nominal</span>
          </div>
          <button className="px-3 py-2 bg-slate-800/60 rounded-md border border-slate-700 text-sm hover:scale-105 transition">
            Global RTH
          </button>
          <button 
            onClick={() => setShowMissionModal(true)}
            className="px-3 py-2 bg-emerald-600 rounded-md text-black font-semibold hover:brightness-110 transition"
          >
            New Mission
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6">
        {/* Left column - Drone Fleet */}
        <section className="col-span-3 bg-gradient-to-b from-slate-800/40 to-slate-900/30 rounded-2xl p-4 border border-slate-800/60 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Drone Fleet ({Object.keys(drones).length})</h3>
          
          {/* Fleet Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-800/30 p-2 rounded-lg text-center">
              <div className="text-emerald-400 font-bold text-lg">{activeCount}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
            <div className="bg-slate-800/30 p-2 rounded-lg text-center">
              <div className="text-blue-400 font-bold text-lg">{avgBattery}%</div>
              <div className="text-xs text-slate-400">Avg Battery</div>
            </div>
          </div>

          <div className="space-y-2 max-h-[42vh] overflow-auto pr-2">
            {Object.values(drones).map((d) => (
              <motion.div
                key={d.drone_id}
                whileHover={{ scale: 1.01 }}
                className={`flex flex-col bg-slate-800/30 p-3 rounded-lg border cursor-pointer transition-all ${
                  selected === d.drone_id ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-slate-700/40'
                }`}
                onClick={() => setSelected(d.drone_id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      {d.drone_id}
                    </div>
                    <div className="text-xs text-slate-400">
                      BATT {d.battery}% · {Math.round(d.alt)}m
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(d.status)} bg-current/20`}>
                    {d.status.toUpperCase()}
                  </div>
                </div>

                {/* Battery Bar */}
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full ${getBatteryColor(d.battery)}`}
                    style={{ width: `${d.battery}%` }}
                  ></div>
                </div>

                {/* Detection Status */}
                {d.detection && (
                  <div className="text-xs">
                    Detection: <span className={`font-semibold ${d.detection === 'Clear' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {d.detection}
                    </span> 
                    {d.confidence > 0 && ` (${(d.confidence * 100).toFixed(1)}%)`}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Middle - Map Area */}
        <section className="col-span-6 rounded-2xl overflow-hidden border border-slate-800/50 shadow-lg bg-gradient-to-br from-slate-900/10 to-slate-900/5">
          <div className="h-[62vh] relative bg-slate-800/20 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Tactical Map View</h3>
              <p className="text-slate-500">Real-time drone positions and patrol routes</p>
              <div className="mt-4 text-sm text-slate-600">
                📍 Area: Delhi NCR Sector | Grid: 28.70°N, 77.10°E
              </div>
            </div>
          </div>
        </section>

        {/* Right column - Detections Panel */}
        <section className="col-span-3 rounded-2xl p-4 border border-slate-800/40 bg-slate-900/10 shadow-inner">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Live Detections</h3>
          
          <div className="space-y-2 text-xs max-h-[50vh] overflow-auto">
            {Object.values(drones).map((d) => (
              <div key={d.drone_id} className={`p-3 rounded-lg border ${
                d.detection === 'Human' ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800/20 border-slate-700/30'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{d.drone_id}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(d.status)} bg-current/20`}>
                    {d.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Detection:</span>
                  <span className={`font-semibold ${d.detection === 'Clear' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {d.detection || "-"}
                  </span>
                </div>
                
                {d.confidence > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-white font-medium">{(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-300">{d.lat.toFixed(3)}, {d.lon.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
              Deploy All Drones
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
              Emergency RTH
            </button>
          </div>
        </section>
      </main>

      <footer className="p-4 text-xs text-slate-500 text-center border-t border-slate-800">
        Guard-X Swarm Dashboard • Detections updated every 5s • Classified Military System
      </footer>

      {/* Mission Modal */}
      {showMissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                New Mission
              </h2>
              <button
                onClick={() => setShowMissionModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMissionSubmit} className="space-y-4">
              {/* Drone Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Drone ID
                </label>
                <select
                  value={missionForm.droneId}
                  onChange={(e) => setMissionForm(prev => ({ ...prev, droneId: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a drone...</option>
                  {Object.values(drones).map((drone) => (
                    <option key={drone.drone_id} value={drone.drone_id}>
                      {drone.drone_id} - {drone.status} ({drone.battery}% battery)
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Area
                </label>
                <select
                  value={missionForm.area}
                  onChange={(e) => setMissionForm(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose patrol area...</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMissionModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Activate Drone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}







