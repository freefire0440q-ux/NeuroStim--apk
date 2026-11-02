/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Main Clinical Dashboard
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 */

import React, { useState } from 'react';
import {
  Activity,
  Play,
  Bluetooth,
  Battery,
  User,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
  Dumbbell,
  ClipboardList,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';
import { SessionRecord } from '../types';

interface DashboardViewProps {
  onOpenBluetooth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenBluetooth }) => {
  const {
    role,
    activePatient,
    setActivePatientId,
    allPatients,
    device,
    currentAssessment,
    setCurrentView,
    startFiveStepWorkflow,
    sessionHistory,
    stimulationStatus,
  } = useNeuroStim();

  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<SessionRecord | null>(null);

  // Weekly activity summary calculation (mocked past 7 days)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyMins = [25, 20, 0, 30, 20, 0, 25]; // minutes per day
  const maxMins = 35;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Welcome Banner & Top Status Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0E1838] via-[#112048] to-[#0A132E] border border-cyan-500/20 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {role === 'physiotherapist' ? 'Clinical Rehabilitation Director' : 'Active Patient Portal'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">
                Supervising: <span className="text-white font-medium">{SUPERVISING_DOCTOR.name}</span>
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {role === 'physiotherapist' ? (
                <>Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">{SUPERVISING_DOCTOR.name}</span></>
              ) : (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">{activePatient.fullName}</span></>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {role === 'physiotherapist'
                ? `Monitoring ${allPatients.length} active rehabilitation patients. Wearable pod ${device.connected ? 'is synchronizing telemetry via BLE 5.3' : 'requires connection'}. Current focus: Post-ACL Quad Re-education.`
                : `Your daily rehabilitation plan is approved by ${SUPERVISING_DOCTOR.name}. Complete today's NMES quad re-education and prescribed range-of-motion routine.`}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={startFiveStepWorkflow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm hover:opacity-95 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start 5-Step Session</span>
            </button>

            <button
              onClick={() => setCurrentView('assessment')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm text-white font-medium transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>Patient Assessment</span>
            </button>
          </div>
        </div>

        {/* Patient Switcher for Dr. Harshit Raj (Physiotherapist Mode) */}
        {role === 'physiotherapist' && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mr-1">
              Select Patient:
            </span>
            {allPatients.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePatientId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePatient.id === p.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.fullName} <span className="opacity-70 text-[10px]">({p.affectedLimb})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Key Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Bluetooth Wearable Status */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wearable Pod</span>
            <button
              onClick={onOpenBluetooth}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Manage
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                device.connected
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
                  : 'bg-rose-950/30 border border-rose-800/40 text-rose-400'
              }`}
            >
              <Bluetooth className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white truncate max-w-[150px]">
                {device.connected ? device.name : 'Device Disconnected'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {device.connected ? `RSSI: ${device.rssiDbm} dBm` : 'Click to pair'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
              <span>Battery:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {device.connected ? `${device.batteryPercentage}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 2: Pain Level Overview */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pain Level (NPRS)</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <TrendingDown className="w-3 h-3" />
              <span>-62% vs Baseline</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {activePatient.currentPainNprs}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10 NPRS</span>
            <span className="text-xs text-slate-500 font-mono ml-auto">
              VAS: {currentAssessment.pain.vas} mm
            </span>
          </div>
          {/* Visual scale bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(activePatient.currentPainNprs / 10) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (No Pain)</span>
              <span>Baseline: {activePatient.baselinePainNprs}</span>
              <span>10 (Severe)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Muscle Activity (sEMG) */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Muscle Activity (sEMG)</span>
            <span className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+24% Activation</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {currentAssessment.muscle.semgPeakMicrovolts}
            </span>
            <span className="text-xs text-slate-400 font-mono">μV Peak</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
            <span className="text-slate-400">VMO/VL Ratio:</span>
            <span className="font-mono font-bold text-cyan-300">
              {currentAssessment.muscle.vmoVlRatio} (Sym: {currentAssessment.muscle.activationSymmetryPct}%)
            </span>
          </div>
        </div>

        {/* Card 4: Rehabilitation Progress */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovery Milestone</span>
            <span className="text-[11px] text-cyan-400 font-mono font-semibold">
              {activePatient.overallRecoveryPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {activePatient.currentFlexionDeg}°
            </span>
            <span className="text-xs text-slate-400 font-mono">Knee Flexion</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(activePatient.currentFlexionDeg / activePatient.targetFlexionDeg) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Start: {activePatient.baselineFlexionDeg}°</span>
              <span>Target: {activePatient.targetFlexionDeg}°</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Split: Patient Detail & Clinical Protocols (Left) + Weekly Activity & Quick Treatment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols on lg): Patient Profile & Treatment Protocol */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Patient Clinical Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {activePatient.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{activePatient.fullName}</h2>
                    <span className="text-xs text-slate-400 font-mono">MRN: {activePatient.medicalRecordNo}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activePatient.age} yrs · {activePatient.gender} · Affected: <span className="text-cyan-300 font-medium">{activePatient.affectedLimb}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contraindications Cleared</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="text-slate-400 font-medium">Primary Clinical Diagnosis</div>
                <div className="font-semibold text-slate-100">{activePatient.primaryDiagnosis}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                <div className="text-slate-400 font-medium">Rehabilitation Stage</div>
                <div className="font-semibold text-cyan-300">{activePatient.rehabMilestone}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-400">
                  Prescribed Clinical Protocol (Dr. Harshit Raj)
                </span>
                <span className="text-[11px] font-mono">Modality: NMES & TENS</span>
              </div>
              <p className="text-slate-300 leading-relaxed pt-1">
                {activePatient.prescribedPlanSummary}
              </p>
            </div>
          </div>

          {/* Previous Sessions History Table */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Previous Rehabilitation Sessions</h3>
                <p className="text-xs text-slate-400">Historical records under supervision of {SUPERVISING_DOCTOR.name}</p>
              </div>
              <button
                onClick={() => setCurrentView('progress')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>View Full History</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 border-t border-b border-slate-800/80">
              {sessionHistory.slice(0, 4).map(ses => (
                <div
                  key={ses.id}
                  onClick={() => setSelectedSessionForDetails(ses)}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        ses.modality === 'NMES'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs sm:text-sm">{ses.protocolName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ses.modality}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{ses.date} at {ses.time}</span>
                        <span>·</span>
                        <span>{ses.durationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Pain Delta</div>
                      <div className="font-bold text-emerald-400">
                        {ses.prePainNprs} → {ses.postPainNprs} NPRS
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Flexion</div>
                      <div className="font-bold text-cyan-300">
                        {ses.postRomDeg}°
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Weekly Activity Chart + Quick Launch Actions */}
        <div className="space-y-6">
          
          {/* Weekly Activity Bar Chart */}
          <div className="p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800/90 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Therapy Adherence</h3>
                <p className="text-[11px] text-slate-400">Total: 120 mins completed this week</p>
              </div>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-4 flex items-end justify-between gap-2 h-36">
              {daysOfWeek.map((day, idx) => {
                const mins = weeklyMins[idx];
                const pct = (mins / maxMins) * 100;
                const isToday = day === 'Mon';
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400">{mins > 0 ? `${mins}m` : '-'}</span>
                    <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-lg h-24 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${
                          isToday
                            ? 'bg-gradient-to-t from-cyan-500 to-teal-300'
                            : mins > 0
                            ? 'bg-cyan-600/70 hover:bg-cyan-500'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-medium ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs flex items-center justify-between">
              <span className="text-slate-400">Therapy Target: 5 sessions/wk</span>
              <span className="text-emerald-400 font-semibold font-mono">80% Achieved</span>
            </div>
          </div>

          {/* Quick Launch Cards */}
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('treatment')}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400/60 text-left transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Treatment Setup</h4>
                    <p className="text-xs text-slate-400">TENS & NMES Clinical Waveforms</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            <button
              onClick={() => setCurrentView('exercises')}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Exercise Library</h4>
                    <p className="text-xs text-slate-400">Guided Knee, Post-Op & Strengthening</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            <button
              onClick={() => setCurrentView('progress')}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Clinical Session Reports</h4>
                    <p className="text-xs text-slate-400">Export & review Dr. Harshit Raj notes</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* Session Details Modal */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B132B] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Session Clinical Record</h3>
                <p className="text-xs text-slate-400">{selectedSessionForDetails.date} at {selectedSessionForDetails.time}</p>
              </div>
              <button
                onClick={() => setSelectedSessionForDetails(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Modality:</span>
                  <div className="font-bold text-white">{selectedSessionForDetails.modality} ({selectedSessionForDetails.protocolName})</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Duration:</span>
                  <div className="font-bold text-white">{selectedSessionForDetails.durationMinutes} Minutes</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Pain Rating Change:</span>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  Pre-session: {selectedSessionForDetails.prePainNprs}/10 → Post-session: {selectedSessionForDetails.postPainNprs}/10 NPRS
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Knee Range of Motion:</span>
                <div className="text-sm font-bold font-mono text-cyan-300">
                  {selectedSessionForDetails.preRomDeg}° → {selectedSessionForDetails.postRomDeg}° Flexion (+{selectedSessionForDetails.postRomDeg - selectedSessionForDetails.preRomDeg}°)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Therapist Clinical Notes:</span>
                <p className="text-slate-200 leading-relaxed italic">
                  "{selectedSessionForDetails.therapistNotes}"
                </p>
                <div className="text-[10px] text-teal-400 font-semibold pt-1">
                  Signed: {selectedSessionForDetails.therapistName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
