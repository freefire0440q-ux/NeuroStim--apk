/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Five-Step Clinical Rehabilitation Workflow Wizard
 * 1. ASSESS -> 2. PLAN -> 3. STIMULATE -> 4. MOVE -> 5. REVIEW
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 */

import React, { useState } from 'react';
import {
  GitFork,
  ClipboardList,
  Sliders,
  Zap,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Play,
  RotateCcw,
  Activity,
  Award,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { SUPERVISING_DOCTOR } from '../data/mockData';
import { WorkflowStep } from '../types';

export const WorkflowWizard: React.FC = () => {
  const {
    workflowStep,
    setWorkflowStep,
    activePatient,
    treatmentPlan,
    currentAssessment,
    stimulationStatus,
    startStimulation,
    pauseStimulation,
    emergencyStop,
    remainingSeconds,
    ch1Active_mA,
    ch2Active_mA,
    completedExercisesInSession,
    setCurrentView,
    addSessionRecord,
  } = useNeuroStim();

  const [postSessionPain, setPostSessionPain] = useState<number>(Math.max(0, currentAssessment.pain.nprs - 1));
  const [postSessionFlexion, setPostSessionFlexion] = useState<number>(currentAssessment.rom.flexionDeg + 2);
  const [reviewNotes, setReviewNotes] = useState<string>(
    `Patient completed prescribed ${treatmentPlan.modality} protocol. No adverse cutaneous reaction. Good neuromuscular activation observed.`
  );
  const [isSaved, setIsSaved] = useState(false);

  const steps: { id: WorkflowStep; stepNum: number; title: string; subtitle: string; icon: any }[] = [
    { id: 'assess', stepNum: 1, title: 'ASSESS', subtitle: 'Record pain, ROM & movement', icon: ClipboardList },
    { id: 'plan', stepNum: 2, title: 'PLAN', subtitle: 'Select TENS/NMES parameters', icon: Sliders },
    { id: 'stimulate', stepNum: 3, title: 'STIMULATE', subtitle: 'Run electrotherapy session', icon: Zap },
    { id: 'move', stepNum: 4, title: 'MOVE', subtitle: 'Guided exercise routine', icon: Dumbbell },
    { id: 'review', stepNum: 5, title: 'REVIEW', subtitle: 'Compare progress & outcomes', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === workflowStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setWorkflowStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setWorkflowStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleFinishAndSave = () => {
    addSessionRecord({
      patientId: activePatient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      therapistName: SUPERVISING_DOCTOR.name,
      modality: treatmentPlan.modality,
      protocolName: treatmentPlan.subType,
      durationMinutes: treatmentPlan.durationMinutes,
      avgChannel1mA: ch1Active_mA,
      avgChannel2mA: ch2Active_mA,
      prePainNprs: currentAssessment.pain.nprs,
      postPainNprs: postSessionPain,
      preRomDeg: currentAssessment.rom.flexionDeg,
      postRomDeg: postSessionFlexion,
      semgPeakMicrovolts: currentAssessment.muscle.semgPeakMicrovolts,
      exercisesCompleted: completedExercisesInSession.length > 0 ? completedExercisesInSession : ['Isometric Quadriceps Sets'],
      patientTolerance: 'Well Tolerated',
      therapistNotes: reviewNotes,
      isEmergencyStopped: false,
    });
    setIsSaved(true);
    setTimeout(() => {
      setCurrentView('dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              Clinical Protocol Pipeline
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">Dr. Harshit Raj, PT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">5-Step Rehabilitation Workflow</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured clinical pathway: Assess → Plan → Stimulate → Move → Review
          </p>
        </div>

        {/* Emergency Stop always accessible */}
        {stimulationStatus === 'running' && (
          <button
            onClick={() => emergencyStop('Emergency stop pressed in workflow wizard.')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-900/40"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Stop</span>
          </button>
        )}
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isActive = st.id === workflowStep;
          const isPassed = idx < currentStepIndex;
          return (
            <button
              key={st.id}
              onClick={() => setWorkflowStep(st.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : isPassed
                  ? 'bg-slate-900/90 border-teal-500/50 text-slate-300'
                  : 'bg-[#0B132B]/60 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-cyan-400' : isPassed ? 'text-teal-400' : 'text-slate-500'}`}>
                  0{st.stepNum}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : isPassed ? 'text-teal-400' : 'text-slate-500'}`} />
              </div>
              <div className={`text-xs font-bold mt-1.5 truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {st.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                {st.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Step Content */}
      <div className="p-6 rounded-2xl bg-[#0B132B]/95 border border-slate-800 shadow-xl space-y-6">
        
        {/* Step 1: ASSESS */}
        {workflowStep === 'assess' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Step 1 of 5</span>
                <h2 className="text-lg font-bold text-white">Record Baseline Pain, ROM & Muscle Response</h2>
              </div>
              <button
                onClick={() => setCurrentView('assessment')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Open Full Assessment Form →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">1. Pain (NPRS & VAS)</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {currentAssessment.pain.nprs} / 10 <span className="text-xs text-slate-400 font-normal">NPRS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  VAS: {currentAssessment.pain.vas} mm · Irritability: <span className="text-cyan-300 font-medium">{currentAssessment.pain.irritability}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">2. Range of Motion (ROM)</span>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {currentAssessment.rom.flexionDeg}° Flexion
                </div>
                <p className="text-[11px] text-slate-400">
                  Extension: {currentAssessment.rom.extensionDeg}° · Measured via {currentAssessment.rom.measurementMethod}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">3. Muscle Biofeedback</span>
                <div className="text-2xl font-bold font-mono text-teal-300">
                  {currentAssessment.muscle.semgPeakMicrovolts} μV
                </div>
                <p className="text-[11px] text-slate-400">
                  VMO/VL Ratio: {currentAssessment.muscle.vmoVlRatio} · Symmetry: {currentAssessment.muscle.activationSymmetryPct}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              Assessment verified for patient <strong>{activePatient.fullName}</strong>. Clinical findings indicate mild patellofemoral pain and VMO inhibition suitable for active NMES muscle re-education.
            </p>
          </div>
        )}

        {/* Step 2: PLAN */}
        {workflowStep === 'plan' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Step 2 of 5</span>
                <h2 className="text-lg font-bold text-white">Physiotherapist Selects Treatment & Parameters</h2>
              </div>
              <button
                onClick={() => setCurrentView('treatment')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Configure Custom Parameters →
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono font-bold text-xs border border-teal-500/40">
                    Modality: {treatmentPlan.modality}
                  </span>
                  <span className="font-bold text-white text-sm">{treatmentPlan.subType}</span>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Dr. Harshit Raj Approved
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Frequency:</span>
                  <div className="font-bold text-white font-mono mt-0.5">{treatmentPlan.frequencyHz} Hz</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Pulse Width:</span>
                  <div className="font-bold text-white font-mono mt-0.5">{treatmentPlan.pulseWidthMicroseconds} μs</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Duration:</span>
                  <div className="font-bold text-white font-mono mt-0.5">{treatmentPlan.durationMinutes} Minutes</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Safety Clamp:</span>
                  <div className="font-bold text-white font-mono mt-0.5">{treatmentPlan.maxTherapistAllowed_mA} mA max</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              *Reminder: TENS and NMES are the only prescribed electrotherapy modalities in this system.
            </p>
          </div>
        )}

        {/* Step 3: STIMULATE */}
        {workflowStep === 'stimulate' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Step 3 of 5</span>
                <h2 className="text-lg font-bold text-white">Start Prescribed TENS or NMES Stimulation</h2>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                Status: {stimulationStatus.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Channel 1 (VMO Motor Point)</span>
                  <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{ch1Active_mA} mA</div>
                </div>
                <span className="text-xs text-slate-400">Target: Visible crisp motor recruitment</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Channel 2 (Rectus Femoris)</span>
                  <div className="text-3xl font-bold font-mono text-teal-400 mt-1">{ch2Active_mA} mA</div>
                </div>
                <span className="text-xs text-slate-400">Target: Synchronous contraction</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stimulationStatus !== 'running' ? (
                <button
                  onClick={startStimulation}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Stimulation Session</span>
                </button>
              ) : (
                <button
                  onClick={pauseStimulation}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Pause Stimulation</span>
                </button>
              )}

              <button
                onClick={() => emergencyStop('Emergency button triggered inside workflow wizard.')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
              >
                Emergency Cutoff
              </button>
            </div>
          </div>
        )}

        {/* Step 4: MOVE */}
        {workflowStep === 'move' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Step 4 of 5</span>
                <h2 className="text-lg font-bold text-white">Perform Guided Rehabilitation Exercises</h2>
              </div>
              <button
                onClick={() => setCurrentView('exercises')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                Open Full Exercise Player →
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Perform active movement while under electrotherapy coverage to maximize motor cortex remapping and joint lubrication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Isometric Quadriceps Sets', reps: '3 sets × 10 reps', focus: 'VMO recruitment & terminal extension' },
                  { name: 'Terminal Knee Extension (TKE)', reps: '3 sets × 12 reps', focus: 'Lockout control against resistance' },
                  { name: 'Active-Assisted Heel Slides', reps: '3 sets × 10 reps', focus: 'Capsular stretch to 120°' },
                  { name: 'Straight Leg Raise (SLR)', reps: '3 sets × 10 reps', focus: 'Extensor lag elimination' },
                ].map(ex => (
                  <div key={ex.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{ex.name}</div>
                      <div className="text-[11px] text-slate-400">{ex.reps} · {ex.focus}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: REVIEW */}
        {workflowStep === 'review' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Step 5 of 5</span>
                <h2 className="text-lg font-bold text-white">Record Results and Compare Progress</h2>
              </div>
              <span className="text-xs text-slate-400">Supervisor: {SUPERVISING_DOCTOR.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold">Post-Session Pain (NPRS):</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{postSessionPain} / 10</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={postSessionPain}
                    onChange={e => setPostSessionPain(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-400 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Pre-session score was {currentAssessment.pain.nprs}/10 ({currentAssessment.pain.nprs - postSessionPain > 0 ? `-${currentAssessment.pain.nprs - postSessionPain} pain reduction` : 'stable'}).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold">Post-Session Flexion (Deg):</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono text-cyan-300">{postSessionFlexion}°</span>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={postSessionFlexion}
                    onChange={e => setPostSessionFlexion(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Pre-session was {currentAssessment.rom.flexionDeg}° (+{postSessionFlexion - currentAssessment.rom.flexionDeg}° immediate joint compliance).
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Physiotherapist Session Review Notes (Dr. Harshit Raj):
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Session logged successfully to clinical records! Returning to Dashboard...</span>
              </div>
            )}
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <span>Next: {steps[currentStepIndex + 1].title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishAndSave}
              disabled={isSaved}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Sign Off Session</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
