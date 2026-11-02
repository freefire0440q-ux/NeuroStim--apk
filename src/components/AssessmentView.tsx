/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Comprehensive Patient Assessment Component
 * Pain Assessment (NPRS/VAS), ROM Goniometer/IMU, Surface EMG, Functional Movement
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Save,
  RotateCcw,
  Compass,
  Zap,
  Activity,
  Timer,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';

export const AssessmentView: React.FC = () => {
  const {
    activePatient,
    device,
    currentAssessment,
    updateAssessmentPain,
    updateAssessmentROM,
    updateAssessmentMuscle,
    updateAssessmentFunction,
    saveAssessment,
    setCurrentView,
  } = useNeuroStim();

  const [activeTab, setActiveTab] = useState<'pain' | 'rom' | 'muscle' | 'function'>('pain');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Local state for smooth assessment interactions
  const [nprsScore, setNprsScore] = useState(currentAssessment.pain.nprs);
  const [vasMm, setVasMm] = useState(currentAssessment.pain.vas);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(currentAssessment.pain.locations);
  const [irritability, setIrritability] = useState(currentAssessment.pain.irritability);

  // ROM state
  const [flexionDeg, setFlexionDeg] = useState(currentAssessment.rom.flexionDeg);
  const [extensionDeg, setExtensionDeg] = useState(currentAssessment.rom.extensionDeg);
  const [romMethod, setRomMethod] = useState(currentAssessment.rom.measurementMethod);

  // EMG state
  const [semgPeak, setSemgPeak] = useState(currentAssessment.muscle.semgPeakMicrovolts);
  const [symmetryPct, setSymmetryPct] = useState(currentAssessment.muscle.activationSymmetryPct);
  const [vmoRatio, setVmoRatio] = useState(currentAssessment.muscle.vmoVlRatio);

  // Functional Movement state
  const [tugSeconds, setTugSeconds] = useState(currentAssessment.function.timedUpAndGoSeconds);
  const [isTugRunning, setIsTugRunning] = useState(false);
  const [stsReps, setStsReps] = useState(currentAssessment.function.sitToStandReps30s);
  const [stsTimer, setStsTimer] = useState(30);
  const [isStsRunning, setIsStsRunning] = useState(false);
  const [movementQuality, setMovementQuality] = useState<1 | 2 | 3 | 4 | 5>(currentAssessment.function.movementQualityRating);
  const [clinicalNotes, setClinicalNotes] = useState(currentAssessment.function.clinicalObservations);

  // TUG stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTugRunning) {
      interval = setInterval(() => {
        setTugSeconds(prev => parseFloat((prev + 0.1).toFixed(1)));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTugRunning]);

  // Sit-to-Stand 30s countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStsRunning && stsTimer > 0) {
      interval = setInterval(() => {
        setStsTimer(prev => prev - 1);
      }, 1000);
    } else if (stsTimer === 0) {
      setIsStsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStsRunning, stsTimer]);

  const bodyLocations = [
    'Anterior Knee (Patellar Tendon)',
    'Medial Joint Line',
    'Lateral Joint Line',
    'Vastus Medialis (VMO)',
    'Rectus Femoris (Quad Belly)',
    'Hamstrings (Biceps Femoris)',
    'Lumbar Paraspinal L4-L5',
    'Rotator Cuff (Supraspinatus)',
    'Ankle Lateral Ligaments',
  ];

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(l => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const syncRomFromImu = () => {
    if (device.connected) {
      setFlexionDeg(device.imu.jointAngle);
      setRomMethod('Wearable IMU Sensor');
    }
  };

  const handleSaveAll = () => {
    updateAssessmentPain(nprsScore, vasMm, selectedLocations, irritability);
    updateAssessmentROM(flexionDeg, extensionDeg, romMethod);
    updateAssessmentMuscle(semgPeak, symmetryPct, vmoRatio);
    updateAssessmentFunction(tugSeconds, stsReps, movementQuality, clinicalNotes);
    saveAssessment();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Clinical Examination</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Dr. Harshit Raj, PT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Patient Assessment Form</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject: {activePatient.fullName} ({activePatient.age}y) · Affected: {activePatient.affectedLimb} · {activePatient.rehabMilestone}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccessNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Assessment Saved</span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Assessment</span>
          </button>
        </div>
      </div>

      {/* 4 Assessment Pillar Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'pain', label: '1. Pain Assessment (NPRS/VAS)' },
          { id: 'rom', label: '2. Range of Motion (ROM)' },
          { id: 'muscle', label: '3. Muscle Response (sEMG)' },
          { id: 'function', label: '4. Function & Movement' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Pain Assessment */}
      {activeTab === 'pain' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Left: NPRS & VAS Sliders */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">NPRS (0–10 Pain Scale)</h2>
              <p className="text-xs text-slate-400">Numeric Pain Rating Scale (Current resting pain)</p>
            </div>

            {/* NPRS Interactive Scale (0 to 10) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Select Pain Score:</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {nprsScore} <span className="text-xs text-slate-400">/ 10</span>
                </span>
              </div>

              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                  const isSelected = nprsScore === val;
                  let colorClass = 'bg-slate-800 text-slate-300 hover:bg-slate-700';
                  if (isSelected) {
                    if (val <= 3) colorClass = 'bg-emerald-500 text-slate-950 font-bold';
                    else if (val <= 6) colorClass = 'bg-amber-500 text-slate-950 font-bold';
                    else colorClass = 'bg-rose-500 text-white font-bold';
                  }
                  return (
                    <button
                      key={val}
                      onClick={() => setNprsScore(val)}
                      className={`h-10 sm:h-12 rounded-lg flex items-center justify-center text-xs sm:text-sm font-mono transition-transform ${colorClass} ${
                        isSelected ? 'scale-105 shadow-lg' : ''
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                <span className="text-emerald-400">0: No Pain</span>
                <span className="text-amber-400">1-3: Mild · 4-6: Mod</span>
                <span className="text-rose-400">7-10: Severe Pain</span>
              </div>
            </div>

            {/* VAS Scale (Visual Analogue Scale 0-100mm) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    VAS (Visual Analogue Scale 0–100 mm)
                  </h3>
                  <p className="text-[11px] text-slate-400">Validated 100mm analog continuum</p>
                </div>
                <span className="text-xl font-bold font-mono text-teal-400">{vasMm} mm</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={vasMm}
                onChange={e => setVasMm(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm (No Hurt)</span>
                <span>50 mm (Moderate)</span>
                <span>100 mm (Worst Possible)</span>
              </div>
            </div>

            {/* Pain Irritability Classification */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Clinical Tissue Irritability
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Moderate', 'High'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setIrritability(level)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      irritability === level
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level} Irritability
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                {irritability === 'Low' && 'Low tissue irritability: Tolerates active NMES strengthening and load progression.'}
                {irritability === 'Moderate' && 'Moderate tissue irritability: Recommended high-frequency TENS sensory gating prior to movement.'}
                {irritability === 'High' && 'High tissue irritability: Limit to non-contractile sensory TENS and gentle active-assisted ROM only.'}
              </p>
            </div>
          </div>

          {/* Right: Pain Location Body Map */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Pain Location Map</h2>
              <p className="text-xs text-slate-400">Click to tag all anatomical areas where the patient reports discomfort</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {bodyLocations.map(loc => {
                const isSelected = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    onClick={() => toggleLocation(loc)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{loc}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-rose-500' : 'bg-slate-700'}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected Summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tagged Pain Zones ({selectedLocations.length})
              </span>
              <p className="text-xs text-cyan-300 leading-relaxed font-mono">
                {selectedLocations.length > 0 ? selectedLocations.join(' · ') : 'No specific locations tagged.'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Range of Motion (Goniometer & IMU) */}
      {activeTab === 'rom' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Left: Goniometer & Wearable IMU Angle Dial */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Joint Angle & Goniometer</h2>
                <p className="text-xs text-slate-400">{activePatient.affectedLimb} Active-Assisted Range</p>
              </div>
              <button
                onClick={syncRomFromImu}
                disabled={!device.connected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 disabled:opacity-50"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Sync Wearable IMU ({device.imu.jointAngle}°)</span>
              </button>
            </div>

            {/* Visual Goniometer Arc Representation */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/70 border border-slate-800 relative">
              <svg className="w-56 h-36" viewBox="0 0 200 110">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Active flexion angle arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#romGradient)"
                  strokeWidth="16"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (flexionDeg / 140) * 251}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="romGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute bottom-6 flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono text-white">{flexionDeg}°</span>
                <span className="text-xs text-slate-400 font-medium">Knee Flexion</span>
              </div>
            </div>

            {/* Angle Adjustment Sliders */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Flexion Angle (0° to 140°):</span>
                  <span className="font-mono font-bold text-cyan-400">{flexionDeg}° / 135° Target</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={flexionDeg}
                  onChange={e => setFlexionDeg(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Extension Deficit (-5° to 10°):</span>
                  <span className="font-mono font-bold text-teal-400">{extensionDeg}° (0° is full lockout)</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="15"
                  value={extensionDeg}
                  onChange={e => setExtensionDeg(parseInt(e.target.value))}
                  className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right: Sensor Method & End-Feel Classification */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">ROM Measurement Standards</h2>
              <p className="text-xs text-slate-400">Clinical validation and joint end-feel classification</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Measurement Instrument
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Wearable IMU Sensor', 'Digital Goniometer'].map(m => (
                  <button
                    key={m}
                    onClick={() => setRomMethod(m as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      romMethod === m
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                End-Feel Observation:
              </span>
              <p className="text-slate-400 leading-relaxed">
                Firm capsular end-feel at {flexionDeg}° with negligible joint effusion. No acute bone-to-bone block detected.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Progress Milestone Passed</span>
              </div>
              <p className="text-slate-300">
                Patient Marcus Vance has advanced from baseline 65° to current {flexionDeg}°, exceeding the 110° milestone required for standard cycling and functional stairs.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Muscle Response (sEMG) */}
      {activeTab === 'muscle' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Surface EMG Telemetry & Microvolts */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Surface EMG (sEMG) Telemetry</h2>
                <p className="text-xs text-slate-400">Vastus Medialis Oblique (VMO) Electrical Activation</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Bandpass: 20–500 Hz
              </span>
            </div>

            {/* EMG Peak Microvolt Gauge */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Peak Voluntary Contraction</span>
                <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-1">
                  {semgPeak} <span className="text-sm text-slate-400 font-normal">μV</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Contralateral Symmetry</span>
                <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
                  {symmetryPct}%
                </div>
              </div>
            </div>

            {/* Simulated Live EMG Waveform Visualizer */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>sEMG Raw Voltage Stream</span>
                <span className="font-mono text-cyan-400">500 Samples/sec</span>
              </div>
              <div className="h-28 bg-slate-950 rounded-xl border border-slate-800/80 p-2 flex items-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <path
                    d="M 0 40 Q 20 20 40 40 T 80 60 T 120 15 T 160 65 T 200 35 T 240 50 T 280 25 T 300 40"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 40 Q 25 35 50 45 T 100 25 T 150 55 T 200 38 T 250 42 T 300 40"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                </svg>
              </div>
            </div>

            {/* Interactive sliders to tune assessment */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Peak sEMG Voltage (50 to 400 μV):</span>
                  <span className="font-mono font-bold text-cyan-400">{semgPeak} μV</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  value={semgPeak}
                  onChange={e => setSemgPeak(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Symmetry vs Uninvolved Limb (40% to 100%):</span>
                  <span className="font-mono font-bold text-teal-400">{symmetryPct}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={symmetryPct}
                  onChange={e => setSymmetryPct(parseInt(e.target.value))}
                  className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right: Muscle Activation Pattern & VMO/VL Ratio */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">VMO vs VL Activation Balance</h2>
              <p className="text-xs text-slate-400">Vastus Medialis Oblique to Vastus Lateralis Firing Ratio</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Calculated VMO:VL Ratio:</span>
                <span className="text-xl font-bold font-mono text-cyan-300">{vmoRatio}</span>
              </div>
              
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, vmoRatio * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5 (Severe VMO Inhibition)</span>
                <span>Target: 1.0 (Balanced)</span>
                <span>1.2 (Optimal)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h3 className="font-bold text-white">Physiotherapist Rationale (Dr. Harshit Raj):</h3>
              <p className="text-slate-300 leading-relaxed">
                Arthrogenic muscle inhibition (AMI) typically suppresses VMO motor unit recruitment after knee surgery. Prescribing NMES at 50Hz during active terminal knee extension overrides this reflex inhibition and restores patellar tracking balance.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Function & Movement Assessment */}
      {activeTab === 'function' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          
          {/* Timed Up and Go (TUG) Test */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Timed Up & Go (TUG) Test</h2>
                <p className="text-xs text-slate-400">Rise from chair, walk 3 meters, turn, return and sit</p>
              </div>
              <Timer className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-5xl font-extrabold font-mono text-white">
                {tugSeconds}s
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTugRunning(!isTugRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isTugRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  {isTugRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                  <span>{isTugRunning ? 'Pause Stopwatch' : 'Start TUG Timer'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsTugRunning(false);
                    setTugSeconds(8.6);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Clinical Interpretation:</span>
                <span className="font-bold text-emerald-400">Normal Mobility (&lt;10s)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Score of 8.6s indicates confident ambulation without fall risk or secondary compensatory deviations.
              </p>
            </div>
          </div>

          {/* 30-Second Sit-to-Stand Test */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">30-Second Sit-to-Stand (STS)</h2>
                <p className="text-xs text-slate-400">Lower extremity muscular endurance benchmark</p>
              </div>
              <span className="text-xs font-mono text-teal-400 font-bold">{stsTimer}s left</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-5xl font-extrabold font-mono text-white">
                {stsReps} <span className="text-sm font-normal text-slate-400">reps</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStsReps(r => r + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
                >
                  +1 Completed Rep
                </button>
                <button
                  onClick={() => setIsStsRunning(!isStsRunning)}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {isStsRunning ? 'Pause Clock' : 'Start 30s'}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Movement Quality Rating (1–5):</span>
                <span className="font-bold font-mono text-cyan-400">{movementQuality} / 5 Stars</span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map(star => (
                  <button
                    key={star}
                    onClick={() => setMovementQuality(star)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      movementQuality >= star
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Therapist Observations & Gait Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Note cadence, antalgic guarding, or weight distribution..."
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Bottom Action strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400">
          Supervising Clinician: <strong className="text-white">{SUPERVISING_DOCTOR.name}</strong> · Registered PT License #{SUPERVISING_DOCTOR.licenseNo}
        </span>
        <button
          onClick={() => setCurrentView('treatment')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <span>Proceed to Treatment Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
