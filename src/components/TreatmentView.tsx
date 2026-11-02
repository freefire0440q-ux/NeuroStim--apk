/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Treatment Setup & Electrotherapy Stimulation Engine
 * Modalities: TENS and NMES only. (STRICT: NO IFC)
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  Pause,
  Square,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Clock,
  Activity,
  Layers,
  Info,
  ChevronRight,
  Bluetooth,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';
import { TreatmentModality } from '../types';

export const TreatmentView: React.FC = () => {
  const {
    role,
    activePatient,
    device,
    treatmentPlan,
    updateTreatmentPlan,
    approveTreatmentAsTherapist,
    stimulationStatus,
    remainingSeconds,
    elapsedSeconds,
    ch1Active_mA,
    ch2Active_mA,
    nmesPhase,
    startStimulation,
    pauseStimulation,
    resumeStimulation,
    stopStimulation,
    emergencyStop,
    adjustIntensity,
    setCurrentView,
  } = useNeuroStim();

  const [selectedElectrodeSite, setSelectedElectrodeSite] = useState<'knee_quad' | 'shoulder' | 'lumbar' | 'ankle'>('knee_quad');
  const [showContraindicationsModal, setShowContraindicationsModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated Waveform Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = '#0F1E36';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center baseline
      const centerY = canvas.height / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Active waveform path
      const isRunning = stimulationStatus === 'running';
      const amp = isRunning ? Math.min(35, (ch1Active_mA / 40) * 32) : 2;

      ctx.lineWidth = 2.5;

      if (treatmentPlan.modality === 'TENS') {
        // High frequency modulated biphasic TENS wave
        ctx.strokeStyle = isRunning ? '#06B6D4' : '#475569';
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const freq = (treatmentPlan.frequencyHz / 100) * 0.08;
          const y = centerY + Math.sin((x + offset) * freq) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // NMES Biphasic Symmetrical Square Pulse Train
        ctx.strokeStyle = isRunning ? '#14B8A6' : '#475569';
        ctx.beginPath();
        const pulsePeriod = 40;
        const pulseWidth = 10;
        for (let x = 0; x < canvas.width; x++) {
          const phase = (x + offset) % pulsePeriod;
          let y = centerY;
          // In NMES off-phase, pulse amplitude is 0
          const phaseAmp = nmesPhase === 'off' ? 0 : nmesPhase === 'rampUp' || nmesPhase === 'rampDown' ? amp * 0.5 : amp;

          if (phase < pulseWidth) {
            y = centerY - phaseAmp; // positive square
          } else if (phase >= pulseWidth && phase < pulseWidth * 2) {
            y = centerY + phaseAmp; // symmetrical negative square
          } else {
            y = centerY; // interpulse interval
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (isRunning) {
        offset += treatmentPlan.modality === 'TENS' ? 2.5 : 1.5;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stimulationStatus, ch1Active_mA, treatmentPlan.modality, treatmentPlan.frequencyHz, nmesPhase]);

  // Handle Modality Switch (Strictly TENS or NMES only)
  const setModality = (mod: TreatmentModality) => {
    if (stimulationStatus === 'running') {
      emergencyStop('Modality cannot be switched during active stimulation.');
      return;
    }
    if (mod === 'TENS') {
      updateTreatmentPlan({
        modality: 'TENS',
        subType: 'Conventional Sensory Gate Control',
        frequencyHz: 100,
        pulseWidthMicroseconds: 120,
        durationMinutes: 20,
        ch1Intensity_mA: 20,
        ch2Intensity_mA: 18,
      });
    } else {
      updateTreatmentPlan({
        modality: 'NMES',
        subType: 'Neuromuscular Quad Re-education',
        frequencyHz: 50,
        pulseWidthMicroseconds: 300,
        durationMinutes: 20,
        rampUpSec: 2,
        onTimeSec: 8,
        rampDownSec: 2,
        offTimeSec: 16,
        ch1Intensity_mA: 28,
        ch2Intensity_mA: 26,
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Header and Supervising Doctor Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Electrotherapy Prescription</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Supervisor: {SUPERVISING_DOCTOR.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Treatment Setup & Stimulation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescription for: {activePatient.fullName} ({activePatient.affectedLimb}) · Modalities: <strong className="text-cyan-300">TENS & NMES Only</strong>
          </p>
        </div>

        {/* Big Red Emergency Stop Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => emergencyStop('EMERGENCY STOP PRESSED: Output zeroed immediately.')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-900/40 active:scale-95 transition-all border border-rose-500/50"
            title="Instant safety cutoff — drops intensity to 0 mA immediately"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>EMERGENCY STOP</span>
          </button>
        </div>
      </div>

      {/* Modality Selector: STRICTLY TENS and NMES ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* TENS Option */}
        <button
          onClick={() => setModality('TENS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            treatmentPlan.modality === 'TENS'
              ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-[#0B132B]/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  treatmentPlan.modality === 'TENS'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                TENS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">TENS – Transcutaneous Electrical Nerve Stimulation</h3>
                <p className="text-xs text-slate-400">Sensory Gate Control & Endorphinergic Pain Relief</p>
              </div>
            </div>
            {treatmentPlan.modality === 'TENS' && (
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="mt-3 text-xs text-slate-300 line-clamp-2">
            Target: A-beta sensory nerve fibers. High frequency (80–120 Hz) or burst mode for acute and subacute knee pain reduction.
          </div>
        </button>

        {/* NMES Option */}
        <button
          onClick={() => setModality('NMES')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            treatmentPlan.modality === 'NMES'
              ? 'bg-gradient-to-br from-teal-950/40 to-slate-900 border-teal-400 shadow-lg shadow-teal-500/10'
              : 'bg-[#0B132B]/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                  treatmentPlan.modality === 'NMES'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                NMES
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">NMES – Neuromuscular Electrical Stimulation</h3>
                <p className="text-xs text-slate-400">Motor Unit Activation, VMO Re-education & Strength</p>
              </div>
            </div>
            {treatmentPlan.modality === 'NMES' && (
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            )}
          </div>
          <div className="mt-3 text-xs text-slate-300 line-clamp-2">
            Target: Motor nerve branches. Biphasic square pulse train (35–50 Hz) with duty cycles (On/Off ramp) to reverse muscle atrophy.
          </div>
        </button>

      </div>

      {/* Main Grid: Telemetry, Waveform & Intensity (Left) + Electrode Placement & Safety (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Oscilloscope Waveform, Session Timer, and Dual Channel Intensity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Waveform & Session Timer Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                    {treatmentPlan.modality} Waveform Monitor
                  </span>
                  {treatmentPlan.modality === 'NMES' && stimulationStatus === 'running' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 uppercase font-semibold">
                      Phase: {nmesPhase}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{treatmentPlan.subType}</h3>
              </div>

              {/* Session Countdown Clock */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Remaining</div>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {formatTime(remainingSeconds)}
                  </div>
                </div>
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            {/* Real-time Oscilloscope Canvas */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Real-Time Symmetrical Biphasic Pulse Train</span>
                <span>{treatmentPlan.frequencyHz} Hz · {treatmentPlan.pulseWidthMicroseconds} μs</span>
              </div>
              <div className="w-full h-36 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={144}
                  className="w-full h-full block"
                />
                {stimulationStatus === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px] text-xs text-slate-400">
                    Standby — Click "Start Stimulation" below to engage wearable pod
                  </div>
                )}
                {stimulationStatus === 'paused' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-[1px] text-xs font-bold text-amber-400">
                    PAUSED — Stimulation currently suspended
                  </div>
                )}
              </div>
            </div>

            {/* Primary Stimulation Controls (Start, Pause, Resume, Stop) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {stimulationStatus === 'idle' || stimulationStatus === 'completed' || stimulationStatus === 'emergency_stopped' ? (
                  <button
                    onClick={startStimulation}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Stimulation</span>
                  </button>
                ) : stimulationStatus === 'running' ? (
                  <button
                    onClick={pauseStimulation}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    <Pause className="w-4 h-4 fill-slate-950" />
                    <span>Pause Session</span>
                  </button>
                ) : (
                  <button
                    onClick={resumeStimulation}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Resume Session</span>
                  </button>
                )}

                {stimulationStatus !== 'idle' && (
                  <button
                    onClick={stopStimulation}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                  >
                    <Square className="w-4 h-4 fill-slate-400" />
                    <span>Complete Session</span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Pod Status:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {stimulationStatus.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Channel Intensity Adjusters (Never auto-increases, step control, max therapist clamp) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Stimulation Intensity Settings</h3>
                <p className="text-xs text-slate-400">
                  Dual isolated channels. Therapist Safety Clamp: {treatmentPlan.maxTherapistAllowed_mA} mA max.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-800/40">
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Therapist Protected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Channel 1 (e.g. Proximal VMO) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold text-white">Channel 1 (CH1)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Motor Point VMO</span>
                </div>

                <div className="flex items-center justify-center py-2">
                  <span className="text-4xl font-extrabold font-mono text-cyan-400">
                    {ch1Active_mA} <span className="text-sm text-slate-400 font-normal">mA</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => adjustIntensity(1, -1)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-95 transition-transform"
                  >
                    -1 mA
                  </button>
                  <button
                    onClick={() => adjustIntensity(1, 1)}
                    disabled={ch1Active_mA >= treatmentPlan.maxTherapistAllowed_mA}
                    className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm active:scale-95 transition-transform disabled:opacity-40"
                  >
                    +1 mA
                  </button>
                </div>
              </div>

              {/* Channel 2 (e.g. Rectus Femoris) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-400" />
                    <span className="text-xs font-bold text-white">Channel 2 (CH2)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Rectus Femoris</span>
                </div>

                <div className="flex items-center justify-center py-2">
                  <span className="text-4xl font-extrabold font-mono text-teal-400">
                    {ch2Active_mA} <span className="text-sm text-slate-400 font-normal">mA</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => adjustIntensity(2, -1)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-95 transition-transform"
                  >
                    -1 mA
                  </button>
                  <button
                    onClick={() => adjustIntensity(2, 1)}
                    disabled={ch2Active_mA >= treatmentPlan.maxTherapistAllowed_mA}
                    className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm active:scale-95 transition-transform disabled:opacity-40"
                  >
                    +1 mA
                  </button>
                </div>
              </div>

            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              *Safety Rule: Intensity never auto-ramps. The patient can decrease mA or stop stimulation at any moment via the hardware pod or in-app emergency cutoff.
            </p>
          </div>

          {/* Clinical Parameters Configuration (Therapist Modifiable) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Protocol Parameters (Dr. Harshit Raj)</h3>
                <p className="text-xs text-slate-400">Targeting electrophysiological thresholds</p>
              </div>
              {role === 'physiotherapist' && (
                <button
                  onClick={approveTreatmentAsTherapist}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400"
                >
                  Approve Protocol
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Frequency (Hz)</span>
                <div className="text-lg font-bold font-mono text-white">{treatmentPlan.frequencyHz} Hz</div>
                <span className="text-[10px] text-slate-400">{treatmentPlan.modality === 'TENS' ? 'High Rate' : 'Tetany'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Pulse Width</span>
                <div className="text-lg font-bold font-mono text-white">{treatmentPlan.pulseWidthMicroseconds} μs</div>
                <span className="text-[10px] text-slate-400">Phase Duration</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Duty Cycle</span>
                <div className="text-lg font-bold font-mono text-white">
                  {treatmentPlan.modality === 'NMES' ? `${treatmentPlan.onTimeSec}s ON / ${treatmentPlan.offTimeSec}s OFF` : 'Continuous'}
                </div>
                <span className="text-[10px] text-slate-400">Ramp: {treatmentPlan.rampUpSec}s</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Duration</span>
                <div className="text-lg font-bold font-mono text-white">{treatmentPlan.durationMinutes} Mins</div>
                <span className="text-[10px] text-slate-400">Prescribed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Electrode Placement Visual Diagrams & Safety Checks */}
        <div className="space-y-6">
          
          {/* Anatomical Electrode Placement Visualizer */}
          <div className="p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Electrode Placement Guidance</h3>
              <p className="text-xs text-slate-400">Visual mapping for optimal motor and sensory capture</p>
            </div>

            {/* Region Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'knee_quad', label: 'Knee (VMO/Quad)' },
                { id: 'shoulder', label: 'Shoulder' },
                { id: 'lumbar', label: 'Lumbar' },
                { id: 'ankle', label: 'Ankle' },
              ].map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedElectrodeSite(site.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedElectrodeSite === site.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {site.label}
                </button>
              ))}
            </div>

            {/* Anatomical SVG Diagram */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative">
              <svg className="w-48 h-60" viewBox="0 0 200 250">
                {/* Anatomical outline for Knee */}
                {selectedElectrodeSite === 'knee_quad' && (
                  <g>
                    {/* Thigh / Knee Silhouette */}
                    <path
                      d="M 60 20 Q 55 90 65 140 Q 60 180 70 230 L 130 230 Q 140 180 135 140 Q 145 90 140 20 Z"
                      fill="#111B38"
                      stroke="#1E293B"
                      strokeWidth="2"
                    />
                    {/* Patella outline */}
                    <ellipse cx="100" cy="140" rx="16" ry="20" fill="#162452" stroke="#06B6D4" strokeWidth="1.5" />
                    <text x="100" y="144" fill="#94A3B8" fontSize="8" textAnchor="middle">PATELLA</text>

                    {/* VMO Muscle Outline */}
                    <path
                      d="M 68 85 Q 75 125 90 135 L 75 140 Z"
                      fill="#0E3A52"
                      stroke="#06B6D4"
                      strokeDasharray="2"
                    />
                    <text x="75" y="110" fill="#22D3EE" fontSize="7">VMO</text>

                    {/* Channel 1 Electrodes (Cyan) */}
                    <circle cx="82" cy="115" r="9" fill="#06B6D4" opacity="0.9" />
                    <text x="82" y="118" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">1+</text>

                    <circle cx="88" cy="155" r="9" fill="#0284C7" opacity="0.9" />
                    <text x="88" y="158" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">1-</text>

                    {/* Channel 2 Electrodes (Teal) */}
                    <circle cx="118" cy="70" r="9" fill="#14B8A6" opacity="0.9" />
                    <text x="118" y="73" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">2+</text>

                    <circle cx="124" cy="120" r="9" fill="#0F766E" opacity="0.9" />
                    <text x="124" y="123" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">2-</text>
                  </g>
                )}

                {/* Other Anatomical Sites */}
                {selectedElectrodeSite === 'shoulder' && (
                  <g>
                    <path d="M 40 40 Q 100 30 160 50 Q 150 120 140 220 L 80 220 Q 60 130 40 40 Z" fill="#111B38" stroke="#1E293B" strokeWidth="2" />
                    <circle cx="95" cy="80" r="9" fill="#06B6D4" />
                    <text x="95" y="83" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">1+</text>
                    <circle cx="130" cy="110" r="9" fill="#0284C7" />
                    <text x="130" y="113" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">1-</text>
                  </g>
                )}

                {selectedElectrodeSite === 'lumbar' && (
                  <g>
                    <rect x="50" y="30" width="100" height="180" rx="12" fill="#111B38" stroke="#1E293B" strokeWidth="2" />
                    <circle cx="80" cy="90" r="9" fill="#06B6D4" /><text x="80" y="93" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">1+</text>
                    <circle cx="80" cy="150" r="9" fill="#0284C7" /><text x="80" y="153" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">1-</text>
                    <circle cx="120" cy="90" r="9" fill="#14B8A6" /><text x="120" y="93" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">2+</text>
                    <circle cx="120" cy="150" r="9" fill="#0F766E" /><text x="120" y="153" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">2-</text>
                  </g>
                )}

                {selectedElectrodeSite === 'ankle' && (
                  <g>
                    <path d="M 70 30 L 70 180 Q 70 220 120 220 L 150 220 Q 150 180 130 180 L 130 30 Z" fill="#111B38" stroke="#1E293B" strokeWidth="2" />
                    <circle cx="90" cy="140" r="9" fill="#06B6D4" /><text x="90" y="143" fill="#040814" fontSize="8" fontWeight="bold" textAnchor="middle">1+</text>
                    <circle cx="115" cy="180" r="9" fill="#0284C7" /><text x="115" y="183" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">1-</text>
                  </g>
                )}
              </svg>

              <div className="flex items-center gap-4 text-[10px] text-slate-300 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> CH1 (VMO Motor Point)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> CH2 (Rectus Femoris)
                </span>
              </div>
            </div>

            {/* Electrode Skin Prep Checklist */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Skin Preparation Protocol:
              </span>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc pl-4">
                <li>Clean skin with alcohol-free wipes; remove lotions and oils.</li>
                <li>Ensure minimum 2-inch separation between electrodes.</li>
                <li>Apply uniform pressure on hydrogel adhesive to guarantee &lt;1000 Ω contact.</li>
              </ul>
            </div>
          </div>

          {/* Safety & Contraindications Reminder */}
          <div className="p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Safety & Contraindications</h3>
              </div>
              <button
                onClick={() => setShowContraindicationsModal(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Full
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Supervising Therapist <strong>{SUPERVISING_DOCTOR.name}</strong> has confirmed patient clearance. Never apply electrodes over the carotid sinus, across the chest, or over active deep vein thrombosis (DVT).
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Approval Stamp:</span>
              <span className="text-teal-400 font-mono font-semibold">
                {treatmentPlan.therapistApproval ? `Verified (${treatmentPlan.approvalTimestamp || 'Active'})` : 'Pending'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Contraindications Modal */}
      {showContraindicationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B132B] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base text-white">Absolute Contraindications & Precautions</h3>
              </div>
              <button
                onClick={() => setShowContraindicationsModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 space-y-1">
                <span className="font-bold text-rose-300 uppercase tracking-wider text-[11px]">
                  Absolute Contraindications:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-200">
                  <li>Implanted cardiac pacemaker or defibrillator (ICD)</li>
                  <li>Over the pregnant uterus or pelvis during pregnancy</li>
                  <li>Suspected or confirmed deep vein thrombosis (DVT) / thrombophlebitis</li>
                  <li>Directly over malignant tumors or metastatic lesions</li>
                  <li>Anterior cervical / carotid sinus region or trans-cranial application</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Clinical Precautions:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                  <li>Impaired skin sensation or active dermatitis under electrode pads</li>
                  <li>History of epilepsy or unexplained seizures</li>
                  <li>Recent surgical intervention where muscle contraction could disrupt bone repair</li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Prescribed strictly under clinical protocol standards of Dr. Harshit Raj, PT.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
