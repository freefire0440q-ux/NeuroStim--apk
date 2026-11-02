/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Progress Tracking & Clinical Rehabilitation Reports
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 */

import React, { useState } from 'react';
import {
  LineChart as ChartIcon,
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';
import { SessionRecord } from '../types';

export const ProgressView: React.FC = () => {
  const {
    activePatient,
    sessionHistory,
    currentAssessment,
  } = useNeuroStim();

  const [timeRange, setTimeRange] = useState<'4w' | '8w' | 'all'>('4w');
  const [selectedReportSession, setSelectedReportSession] = useState<SessionRecord | null>(null);

  // Historical data points for charts
  const romProgressData = [
    { label: 'Wk 1', flexion: 65, pain: 8, semg: 110 },
    { label: 'Wk 2', flexion: 82, pain: 6, semg: 145 },
    { label: 'Wk 3', flexion: 98, pain: 5, semg: 175 },
    { label: 'Wk 4', flexion: 118, pain: 3, semg: 215 },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Outcome Measures</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Dr. Harshit Raj, PT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Rehabilitation Progress & Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Patient: {activePatient.fullName} · Diagnosis: {activePatient.primaryDiagnosis}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Clinical Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Trajectory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pain Score Reduction */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pain Score (NPRS)</span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5 font-bold">
              <TrendingDown className="w-3.5 h-3.5" /> -62.5%
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-extrabold text-white">{activePatient.baselinePainNprs}</span>
            <span className="text-slate-500">→</span>
            <span className="text-3xl font-extrabold text-emerald-400">{activePatient.currentPainNprs}</span>
            <span className="text-xs text-slate-400 font-sans">/ 10 NPRS</span>
          </div>
          <p className="text-[11px] text-slate-400">
            VAS improved from 78mm to {currentAssessment.pain.vas}mm. Marked decrease in resting joint tenderness.
          </p>
        </div>

        {/* ROM Flexion Progression */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knee Flexion (ROM)</span>
            <span className="text-xs text-cyan-400 flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +53° Gain
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-extrabold text-white">{activePatient.baselineFlexionDeg}°</span>
            <span className="text-slate-500">→</span>
            <span className="text-3xl font-extrabold text-cyan-400">{activePatient.currentFlexionDeg}°</span>
            <span className="text-xs text-slate-400 font-sans">/ {activePatient.targetFlexionDeg}°</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Extension deficit resolved (0° full lockout restored). Flexion is 87% of target.
          </p>
        </div>

        {/* sEMG Peak Muscle Recruitment */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">VMO Electrical Activity</span>
            <span className="text-xs text-teal-400 flex items-center gap-0.5 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +95% Gain
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-extrabold text-white">110</span>
            <span className="text-slate-500">→</span>
            <span className="text-3xl font-extrabold text-teal-400">{currentAssessment.muscle.semgPeakMicrovolts}</span>
            <span className="text-xs text-slate-400 font-sans">μV Peak</span>
          </div>
          <p className="text-[11px] text-slate-400">
            VMO/VL ratio improved from 0.52 to {currentAssessment.muscle.vmoVlRatio}. Minimal quadriceps lag remaining.
          </p>
        </div>

        {/* Total Sessions & Compliance */}
        <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Therapy Compliance</span>
            <span className="text-xs text-cyan-400 font-bold font-mono">92% High</span>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl font-extrabold text-white">{sessionHistory.length}</span>
            <span className="text-xs text-slate-400 font-sans">Sessions Logged</span>
          </div>
          <p className="text-[11px] text-slate-400">
            14 total protocol treatments completed with 0 adverse events or emergency stops.
          </p>
        </div>

      </div>

      {/* Trajectory Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: ROM & sEMG Progress Trajectory */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Range of Motion & sEMG Trajectory</h3>
              <p className="text-xs text-slate-400">Progression from Week 1 to Current Week 4</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> ROM (Deg)
              </span>
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> sEMG (μV)
              </span>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="h-48 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
            <div className="relative w-full h-36">
              <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />

                {/* Target ROM line (135 deg) */}
                <line x1="0" y1="10" x2="400" y2="10" stroke="#06B6D4" strokeWidth="1" strokeDasharray="4" opacity="0.4" />

                {/* ROM Curve (cyan) */}
                <path
                  d="M 20 90 L 140 65 L 260 40 L 380 18"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="90" r="4" fill="#06B6D4" />
                <circle cx="140" cy="65" r="4" fill="#06B6D4" />
                <circle cx="260" cy="40" r="4" fill="#06B6D4" />
                <circle cx="380" cy="18" r="5" fill="#22D3EE" />

                {/* sEMG Curve (teal) */}
                <path
                  d="M 20 95 L 140 75 L 260 52 L 380 28"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                  strokeDasharray="4"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="95" r="3.5" fill="#14B8A6" />
                <circle cx="140" cy="75" r="3.5" fill="#14B8A6" />
                <circle cx="260" cy="52" r="3.5" fill="#14B8A6" />
                <circle cx="380" cy="28" r="4" fill="#2DD4BF" />
              </svg>
            </div>

            {/* Labels under x-axis */}
            <div className="flex justify-between text-xs font-mono text-slate-400 border-t border-slate-800 pt-1">
              {romProgressData.map(d => (
                <div key={d.label} className="text-center">
                  <div>{d.label}</div>
                  <div className="text-[10px] text-cyan-300 font-bold">{d.flexion}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Pain Score Trajectory (NPRS Over Time) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pain Relief Timeline (NPRS)</h3>
              <p className="text-xs text-slate-400">Pre vs Post-Session Electrotherapy Response</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold font-mono">Consistent Gating</span>
          </div>

          <div className="h-48 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
            <div className="relative w-full h-36">
              <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="400" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#1E293B" strokeWidth="1" strokeDasharray="3" />

                {/* Pain Curve (Emerald dropping down) */}
                <path
                  d="M 20 25 L 140 45 L 260 65 L 380 95"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="25" r="4" fill="#EF4444" />
                <circle cx="140" cy="45" r="4" fill="#F59E0B" />
                <circle cx="260" cy="65" r="4" fill="#10B981" />
                <circle cx="380" cy="95" r="5" fill="#34D399" />
              </svg>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400 border-t border-slate-800 pt-1">
              {romProgressData.map(d => (
                <div key={d.label} className="text-center">
                  <div>{d.label}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">{d.pain}/10 NPRS</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Official Clinical Session Report (Print & Supervisory Signature) */}
      <div className="p-6 rounded-2xl bg-[#0B132B]/95 border border-cyan-500/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Official Clinical Progress Summary
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">NeuroStim+ Medical Record System</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Supervisory Rehabilitation Report</h2>
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="text-slate-400">Date Generated</div>
            <div className="font-mono font-bold text-white">{new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Patient Details</span>
            <div className="font-bold text-white text-sm">{activePatient.fullName}</div>
            <div className="text-slate-400">MRN: {activePatient.medicalRecordNo} · Age: {activePatient.age}y</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Attending Clinician</span>
            <div className="font-bold text-teal-300 text-sm">{SUPERVISING_DOCTOR.name}</div>
            <div className="text-slate-400">{SUPERVISING_DOCTOR.title}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Modalities Prescribed</span>
            <div className="font-bold text-cyan-300 text-sm">TENS & NMES (Dual Channel)</div>
            <div className="text-slate-400">Biphasic Symmetrical Square Wave</div>
          </div>
        </div>

        {/* Narrative Clinical Impression */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Therapist Clinical Impression & Recommendations
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Patient Marcus Vance has shown outstanding progress in recovery from post-ACL reconstruction. Under supervised wireless NMES at 50Hz, voluntary motor recruitment of the Vastus Medialis Oblique (VMO) has increased by 95% above early post-op inhibition levels. Pain has decreased from severe (NPRS 8/10) to mild (NPRS 3/10). Range of motion has reached 118° flexion with 0° extension deficit.
          </p>
          <p className="text-slate-300 leading-relaxed pt-1">
            Plan: Continue daily NMES quadriceps re-education protocols combined with progressive closed-chain squats and band walks. Maintain post-exercise conventional TENS for joint pain modulation as needed.
          </p>

          <div className="pt-4 mt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              Clinical Signature: <strong className="text-white font-mono">{SUPERVISING_DOCTOR.name}, MPT</strong>
            </div>
            <div className="text-[10px] text-teal-400 font-mono">
              License Verified: {SUPERVISING_DOCTOR.licenseNo} · Validated
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
