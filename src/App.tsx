/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ – Smart. Wireless. Wearable.
 * Treatment Modalities: TENS and NMES only.
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 */

import React, { useState } from 'react';
import { NeuroStimProvider, useNeuroStim } from './context/NeuroStimContext';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { BluetoothModal } from './components/BluetoothModal';
import { DashboardView } from './components/DashboardView';
import { AssessmentView } from './components/AssessmentView';
import { TreatmentView } from './components/TreatmentView';
import { ExerciseView } from './components/ExerciseView';
import { ProgressView } from './components/ProgressView';
import { WorkflowWizard } from './components/WorkflowWizard';
import { ShieldAlert, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, stimulationStatus, emergencyStop } = useNeuroStim();
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenBluetooth={() => setIsBluetoothModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-12">
        {currentView === 'dashboard' && (
          <DashboardView onOpenBluetooth={() => setIsBluetoothModalOpen(true)} />
        )}
        {currentView === 'workflow' && <WorkflowWizard />}
        {currentView === 'assessment' && <AssessmentView />}
        {currentView === 'treatment' && <TreatmentView />}
        {currentView === 'exercises' && <ExerciseView />}
        {currentView === 'progress' && <ProgressView />}
      </main>

      {/* Floating Emergency Stop Bar if stimulation is running in background */}
      {stimulationStatus === 'running' && currentView !== 'treatment' && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-50 animate-bounce">
          <button
            onClick={() => emergencyStop('Emergency cutoff clicked from floating action bar.')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-rose-950/80 border border-rose-400 active:scale-95 transition-all"
            title="Instantaneous stimulation cutoff"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span>EMERGENCY STOP</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Tab Navigation */}
      <BottomTabBar />

      {/* Bluetooth Connection & Telemetry Modal */}
      <BluetoothModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
      />

      {/* Clean, professional clinical footer */}
      <footer className="border-t border-slate-800/80 bg-[#040814] py-6 px-4 sm:px-6 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">NeuroStim+</span>
            <span>·</span>
            <span>Smart. Wireless. Wearable.</span>
            <span>·</span>
            <span>Lead Physiotherapist: <strong className="text-slate-200">Dr. Harshit Raj</strong></span>
          </div>
          <div className="text-[11px] text-slate-500">
            Medical Device Standard IEC 60601-2-10 Compliant · Modalities: TENS & NMES Only
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <NeuroStimProvider>
      <AppContent />
    </NeuroStimProvider>
  );
}
