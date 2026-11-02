/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Exercise & Rehabilitation Guidance Library
 * Categories: Knee, Post-Op, Muscle Relaxation, Sports Injury, ROM, Strengthening
 */

import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Compass,
  Zap,
  Info,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import { ExerciseItem } from '../types';
import { SUPERVISING_DOCTOR } from '../data/mockData';

export const ExerciseView: React.FC = () => {
  const {
    exerciseLibrary,
    device,
    activeExercise,
    setActiveExercise,
    completedExercisesInSession,
    markExerciseCompleted,
    setCurrentView,
  } = useNeuroStim();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Exercise Interactive Player State
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [holdTimer, setHoldTimer] = useState(0);
  const [isHoldActive, setIsHoldActive] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // When active exercise changes, reset state
  useEffect(() => {
    if (activeExercise) {
      setCurrentSet(1);
      setCurrentRep(0);
      setHoldTimer(activeExercise.holdSeconds);
      setIsHoldActive(false);
      setIsDone(false);
    }
  }, [activeExercise]);

  // Hold timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isHoldActive && holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer(prev => prev - 1);
      }, 1000);
    } else if (isHoldActive && holdTimer === 0) {
      // Completed hold
      setIsHoldActive(false);
      if (activeExercise) {
        if (currentRep + 1 >= activeExercise.targetReps) {
          if (currentSet >= activeExercise.targetSets) {
            setIsDone(true);
            markExerciseCompleted(activeExercise.name);
          } else {
            setCurrentSet(s => s + 1);
            setCurrentRep(0);
            setHoldTimer(activeExercise.holdSeconds);
          }
        } else {
          setCurrentRep(r => r + 1);
          setHoldTimer(activeExercise.holdSeconds);
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHoldActive, holdTimer, currentRep, currentSet, activeExercise, markExerciseCompleted]);

  const categories = [
    { id: 'all', label: 'All Exercises' },
    { id: 'knee', label: 'Knee Rehabilitation' },
    { id: 'post-op', label: 'Post-Operative' },
    { id: 'relaxation', label: 'Muscle Relaxation' },
    { id: 'sports', label: 'Sports Injury' },
    { id: 'rom', label: 'Range of Motion' },
    { id: 'strengthening', label: 'Strengthening' },
  ];

  const filteredExercises =
    selectedCategory === 'all'
      ? exerciseLibrary
      : exerciseLibrary.filter(ex => ex.category === selectedCategory);

  const startHoldCount = () => {
    if (!activeExercise) return;
    setHoldTimer(activeExercise.holdSeconds);
    setIsHoldActive(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B132B]/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Exercise Protocol</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">{SUPERVISING_DOCTOR.name}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Rehabilitation & Exercise Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Wearable IMU-guided exercises with concurrent TENS/NMES neuro-activation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="text-slate-400">Completed in Session:</span>
          <span className="text-emerald-400 font-bold">{completedExercisesInSession.length}</span>
        </div>
      </div>

      {/* Category Filter Pills (Functional Filter Tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Exercise Cards List (Left) & Active Guided Player Modal / Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Exercise Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredExercises.map(ex => {
            const isCompleted = completedExercisesInSession.includes(ex.name);
            const isCurrent = activeExercise?.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setActiveExercise(ex)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-900 border-teal-400 shadow-lg shadow-teal-500/10 scale-[1.01]'
                    : isCompleted
                    ? 'bg-slate-950/60 border-emerald-500/40 opacity-90'
                    : 'bg-[#0B132B]/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ex.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ex.difficulty === 'Beginner'
                          ? 'text-emerald-400 bg-emerald-950/50'
                          : ex.difficulty === 'Intermediate'
                          ? 'text-cyan-400 bg-cyan-950/50'
                          : 'text-amber-400 bg-amber-950/50'
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300">
                    {ex.targetSets} sets × {ex.targetReps} reps
                  </span>

                  <div className="flex items-center gap-1.5 font-semibold text-teal-400 text-[11px]">
                    {isCompleted ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span>Start Guide</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Exercise Guidance Panel */}
        <div className="space-y-6">
          {activeExercise ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0B132B] border border-teal-500/40 shadow-xl space-y-5 animate-in fade-in sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                    Interactive Coach
                  </span>
                  <h3 className="text-base font-bold text-white">{activeExercise.name}</h3>
                </div>
                {isDone && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                    <CheckCircle2 className="w-4 h-4" /> Finished
                  </span>
                )}
              </div>

              {/* Set & Rep Repetition Counter */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Set</span>
                  <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                    {currentSet} <span className="text-xs text-slate-400">/ {activeExercise.targetSets}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Repetitions</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-300 mt-0.5">
                    {currentRep} <span className="text-xs text-slate-400">/ {activeExercise.targetReps}</span>
                  </div>
                </div>
              </div>

              {/* Hold Timer / IMU angle feedback */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Isometric Contraction Hold</span>
                </div>

                <div className="text-4xl font-extrabold font-mono text-white">
                  {holdTimer}s
                </div>

                <button
                  onClick={startHoldCount}
                  disabled={isHoldActive || isDone}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isHoldActive ? 'Holding Contraction...' : 'Trigger Isometric Hold'}</span>
                </button>
              </div>

              {/* Wearable IMU Real-Time Angle stream */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Wearable Pod Angle:</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{device.imu.jointAngle}°</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {activeExercise.targetAngleDeg !== undefined
                    ? `Target lockout angle: ${activeExercise.targetAngleDeg}°. Live feedback from knee pod sensor.`
                    : 'Joint angle streamed directly from wearable 6-axis IMU.'}
                </p>
              </div>

              {/* Step-by-Step Clinical Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Technique Instructions
                </h4>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  {activeExercise.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Clinical Focus Note */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-1">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px]">
                  Clinical Focus (Dr. Harshit Raj):
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {activeExercise.clinicalFocus}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0B132B]/80 border border-slate-800 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">Select an Exercise</h3>
              <p className="text-xs text-slate-400">
                Click any exercise on the left to start guided coaching with live wearable IMU biofeedback and repetition counting.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
