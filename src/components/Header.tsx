/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Header Component
 */

import React, { useState } from 'react';
import {
  Activity,
  Bluetooth,
  Battery,
  BatteryCharging,
  ShieldAlert,
  User,
  Stethoscope,
  ChevronDown,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';

interface HeaderProps {
  onOpenBluetooth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBluetooth }) => {
  const {
    role,
    setRole,
    activePatient,
    device,
    currentView,
    setCurrentView,
    stimulationStatus,
    emergencyStop,
    safetyAlert,
    clearSafetyAlert,
  } = useNeuroStim();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <>
      {/* Global Safety Alert Banner */}
      {safetyAlert && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 text-rose-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between z-50 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="font-medium">{safetyAlert}</span>
          </div>
          <button
            onClick={clearSafetyAlert}
            className="text-rose-400 hover:text-white px-2 py-0.5 rounded text-xs ml-2 uppercase font-semibold tracking-wider shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Wordmark & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">
                    NeuroStim<span className="text-cyan-400">+</span>
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-cyan-400/90 uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
                    BLE 5.3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Smart · Wireless · Wearable</p>
              </div>
            </button>
          </div>

          {/* Navigation links for tablet & desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'workflow', label: '5-Step Workflow' },
              { id: 'assessment', label: 'Assessment' },
              { id: 'treatment', label: 'Treatment Setup' },
              { id: 'exercises', label: 'Exercise Library' },
              { id: 'progress', label: 'Progress Tracking' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  currentView === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Stimulation status + BLE status + Role switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Stimulation Quick Safety Indicator */}
            {stimulationStatus === 'running' && (
              <button
                onClick={() => emergencyStop('Emergency stop activated from top navigation bar.')}
                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-rose-600/30 animate-pulse"
                title="Immediate Emergency Stimulation Cutoff"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EMERGENCY STOP</span>
              </button>
            )}

            {/* Bluetooth connection quick button */}
            <button
              onClick={onOpenBluetooth}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                device.connected
                  ? 'bg-slate-800/90 border-cyan-500/40 text-slate-200 hover:border-cyan-400'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-300 hover:bg-rose-900/30'
              }`}
              title="Click to view Bluetooth wearable pod details"
            >
              <Bluetooth
                className={`w-3.5 h-3.5 ${device.connected ? 'text-cyan-400 animate-pulse' : 'text-rose-400'}`}
              />
              <span className="hidden sm:inline font-mono text-[11px]">
                {device.connected ? `${device.batteryPercentage}%` : 'Disconnected'}
              </span>
              {device.connected && (
                device.isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Battery className="w-3.5 h-3.5 text-cyan-400" />
                )
              )}
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
              >
                {role === 'physiotherapist' ? (
                  <>
                    <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                    <span className="font-medium hidden sm:inline">{SUPERVISING_DOCTOR.name}</span>
                    <span className="text-[10px] text-teal-400 font-mono hidden lg:inline">PT</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium hidden sm:inline">{activePatient.fullName}</span>
                    <span className="text-[10px] text-cyan-400 font-mono hidden lg:inline">Patient</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    Switch Account View
                  </div>
                  <button
                    onClick={() => {
                      setRole('physiotherapist');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 ${
                      role === 'physiotherapist' ? 'text-teal-400 bg-teal-950/20 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-400" />
                      <div>
                        <div>{SUPERVISING_DOCTOR.name}</div>
                        <div className="text-[10px] text-slate-400">Lead Physiotherapist (Full Access)</div>
                      </div>
                    </div>
                    {role === 'physiotherapist' && <span className="text-xs text-teal-400">Active</span>}
                  </button>
                  <button
                    onClick={() => {
                      setRole('patient');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 ${
                      role === 'patient' ? 'text-cyan-400 bg-cyan-950/20 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div>{activePatient.fullName}</div>
                        <div className="text-[10px] text-slate-400">Patient Mode (Prescribed Routine)</div>
                      </div>
                    </div>
                    {role === 'patient' && <span className="text-xs text-cyan-400">Active</span>}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>
    </>
  );
};
