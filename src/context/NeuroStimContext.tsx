/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Central Clinical State Context
 * Supervising Clinician: Dr. Harshit Raj (PT, MPT)
 * Treatment Modalities: TENS and NMES only.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  BluetoothDevice,
  ExerciseItem,
  PatientAssessment,
  PatientProfile,
  SessionRecord,
  TreatmentModality,
  TreatmentParameters,
  UserRole,
  WorkflowStep,
} from '../types';
import {
  INITIAL_ASSESSMENT,
  INITIAL_EXERCISES,
  INITIAL_PATIENTS,
  INITIAL_SESSIONS,
  INITIAL_TREATMENT_PLAN,
  SUPERVISING_DOCTOR,
} from '../data/mockData';
import { INITIAL_DEVICE_STATE } from '../services/bluetoothService';

export type StimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'emergency_stopped';

interface NeuroStimContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activePatient: PatientProfile;
  setActivePatientId: (id: string) => void;
  allPatients: PatientProfile[];
  
  // Bluetooth device state
  device: BluetoothDevice;
  connectDevice: (deviceId?: string) => void;
  disconnectDevice: () => void;
  toggleLeadDetachmentSim: (leadKey: 'ch1_leadA' | 'ch1_leadB' | 'ch2_leadA' | 'ch2_leadB') => void;
  isScanningBle: boolean;
  setIsScanningBle: (val: boolean) => void;
  
  // Active Navigation
  currentView: 'dashboard' | 'assessment' | 'treatment' | 'exercises' | 'progress' | 'devices' | 'workflow';
  setCurrentView: (view: 'dashboard' | 'assessment' | 'treatment' | 'exercises' | 'progress' | 'devices' | 'workflow') => void;

  // 5-Step Workflow
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  startFiveStepWorkflow: () => void;

  // Patient Assessment
  currentAssessment: PatientAssessment;
  updateAssessmentPain: (nprs: number, vas: number, locations: string[], irritability?: 'Low' | 'Moderate' | 'High') => void;
  updateAssessmentROM: (flexion: number, extension: number, method?: string) => void;
  updateAssessmentMuscle: (semgPeak: number, symmetry: number, vmoVlRatio: number) => void;
  updateAssessmentFunction: (tug: number, sitToStand: number, quality: 1 | 2 | 3 | 4 | 5, notes?: string) => void;
  saveAssessment: () => void;

  // Treatment Configuration & Stimulation (TENS & NMES ONLY)
  treatmentPlan: TreatmentParameters;
  updateTreatmentPlan: (params: Partial<TreatmentParameters>) => void;
  approveTreatmentAsTherapist: () => void;
  
  stimulationStatus: StimulationStatus;
  elapsedSeconds: number;
  remainingSeconds: number;
  ch1Active_mA: number;
  ch2Active_mA: number;
  nmesPhase: 'rampUp' | 'on' | 'rampDown' | 'off';
  startStimulation: () => boolean;
  pauseStimulation: () => void;
  resumeStimulation: () => void;
  stopStimulation: () => void;
  emergencyStop: (reason?: string) => void;
  adjustIntensity: (channel: 1 | 2, delta: number) => void;

  // Exercises
  exerciseLibrary: ExerciseItem[];
  activeExercise: ExerciseItem | null;
  setActiveExercise: (exercise: ExerciseItem | null) => void;
  completedExercisesInSession: string[];
  markExerciseCompleted: (exerciseName: string) => void;

  // Session History & Reports
  sessionHistory: SessionRecord[];
  addSessionRecord: (record: Omit<SessionRecord, 'id'>) => void;
  lastCompletedSession: SessionRecord | null;

  // Safety & Notification Alert
  safetyAlert: string | null;
  clearSafetyAlert: () => void;
}

const NeuroStimContext = createContext<NeuroStimContextType | undefined>(undefined);

export const NeuroStimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Role & Patients
  const [role, setRole] = useState<UserRole>('physiotherapist'); // Default to Dr. Harshit Raj PT for full clinical inspection
  const [allPatients, setAllPatients] = useState<PatientProfile[]>(() => {
    const saved = localStorage.getItem('ns_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [activePatientId, setActivePatientIdState] = useState<string>('pat-001');

  const activePatient = allPatients.find(p => p.id === activePatientId) || allPatients[0];

  const setActivePatientId = (id: string) => {
    setActivePatientIdState(id);
  };

  // Device
  const [device, setDevice] = useState<BluetoothDevice>(() => {
    const saved = localStorage.getItem('ns_device');
    return saved ? JSON.parse(saved) : INITIAL_DEVICE_STATE;
  });
  const [isScanningBle, setIsScanningBle] = useState(false);

  // Navigation
  const [currentView, setCurrentView] = useState<'dashboard' | 'assessment' | 'treatment' | 'exercises' | 'progress' | 'devices' | 'workflow'>('dashboard');
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('assess');

  // Assessment
  const [currentAssessment, setCurrentAssessment] = useState<PatientAssessment>(() => {
    const saved = localStorage.getItem('ns_current_assessment');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENT;
  });

  // Treatment Plan
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentParameters>(() => {
    const saved = localStorage.getItem('ns_treatment_plan');
    return saved ? JSON.parse(saved) : INITIAL_TREATMENT_PLAN;
  });

  // Stimulation Engine
  const [stimulationStatus, setStimulationStatus] = useState<StimulationStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ch1Active_mA, setCh1Active_mA] = useState(treatmentPlan.ch1Intensity_mA);
  const [ch2Active_mA, setCh2Active_mA] = useState(treatmentPlan.ch2Intensity_mA);
  const [nmesPhase, setNmesPhase] = useState<'rampUp' | 'on' | 'rampDown' | 'off'>('on');

  // Safety Alert
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);

  // Exercises
  const [exerciseLibrary] = useState<ExerciseItem[]>(INITIAL_EXERCISES);
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);
  const [completedExercisesInSession, setCompletedExercisesInSession] = useState<string[]>([]);

  // Session History
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem('ns_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });
  const [lastCompletedSession, setLastCompletedSession] = useState<SessionRecord | null>(sessionHistory[0] || null);

  // Remaining Seconds calculation
  const totalDurationSeconds = treatmentPlan.durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('ns_sessions', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem('ns_patients', JSON.stringify(allPatients));
  }, [allPatients]);

  // Real-time telemetry simulation when device is connected
  useEffect(() => {
    if (!device.connected) return;

    const interval = setInterval(() => {
      setDevice(prev => {
        // Minor natural micro-fluctuations in IMU and sEMG telemetry
        const angleNoise = (Math.random() - 0.5) * 1.5;
        const pitchNoise = (Math.random() - 0.5) * 0.8;
        return {
          ...prev,
          imu: {
            ...prev.imu,
            jointAngle: Math.max(0, Math.min(145, Math.round(prev.imu.jointAngle + angleNoise))),
            pitch: parseFloat((prev.imu.pitch + pitchNoise).toFixed(1)),
            gyroRate: parseFloat((Math.random() * 0.8).toFixed(2)),
          },
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [device.connected]);

  // Stimulation timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (stimulationStatus === 'running') {
      timer = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          if (next >= totalDurationSeconds) {
            // Treatment finished
            handleSessionCompletion();
            return totalDurationSeconds;
          }

          // If NMES, update duty cycle phases
          if (treatmentPlan.modality === 'NMES') {
            const cycleDuration = treatmentPlan.rampUpSec + treatmentPlan.onTimeSec + treatmentPlan.rampDownSec + treatmentPlan.offTimeSec;
            const cycleTime = next % cycleDuration;

            if (cycleTime < treatmentPlan.rampUpSec) {
              setNmesPhase('rampUp');
            } else if (cycleTime < treatmentPlan.rampUpSec + treatmentPlan.onTimeSec) {
              setNmesPhase('on');
            } else if (cycleTime < treatmentPlan.rampUpSec + treatmentPlan.onTimeSec + treatmentPlan.rampDownSec) {
              setNmesPhase('rampDown');
            } else {
              setNmesPhase('off');
            }
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stimulationStatus, totalDurationSeconds, treatmentPlan]);

  // Lead detachment safety interlock: if any lead is disconnected during running stimulation, STOP immediately!
  useEffect(() => {
    if (stimulationStatus === 'running') {
      const { ch1_leadA, ch1_leadB, ch2_leadA, ch2_leadB } = device.leadStatus;
      if (
        ch1_leadA.status === 'disconnected' ||
        ch1_leadB.status === 'disconnected' ||
        ch2_leadA.status === 'disconnected' ||
        ch2_leadB.status === 'disconnected'
      ) {
        emergencyStop('SAFETY INTERLOCK: Electrode contact lost. Stimulation stopped immediately to prevent skin irritation.');
      }
    }
  }, [device.leadStatus, stimulationStatus]);

  const connectDevice = (deviceId: string = 'pod-pro-a14') => {
    setDevice(prev => ({
      ...prev,
      id: deviceId,
      connected: true,
      lastSync: 'Just now',
    }));
  };

  const disconnectDevice = () => {
    if (stimulationStatus === 'running') {
      emergencyStop('Device disconnected during active stimulation.');
    }
    setDevice(prev => ({
      ...prev,
      connected: false,
    }));
  };

  const toggleLeadDetachmentSim = (leadKey: 'ch1_leadA' | 'ch1_leadB' | 'ch2_leadA' | 'ch2_leadB') => {
    setDevice(prev => {
      const current = prev.leadStatus[leadKey];
      const newStatus = current.status === 'good' ? 'disconnected' : 'good';
      const newImpedance = newStatus === 'good' ? 420 : 9999;
      return {
        ...prev,
        leadStatus: {
          ...prev.leadStatus,
          [leadKey]: { status: newStatus, impedance: newImpedance },
        },
      };
    });
  };

  // Assessment updaters
  const updateAssessmentPain = (nprs: number, vas: number, locations: string[], irritability?: 'Low' | 'Moderate' | 'High') => {
    setCurrentAssessment(prev => ({
      ...prev,
      pain: {
        ...prev.pain,
        nprs,
        vas,
        locations,
        intensity: nprs <= 3 ? 'Mild (1-3)' : nprs <= 6 ? 'Moderate (4-6)' : 'Severe (7-10)',
        irritability: irritability || prev.pain.irritability,
      },
    }));
  };

  const updateAssessmentROM = (flexion: number, extension: number, method?: string) => {
    setCurrentAssessment(prev => ({
      ...prev,
      rom: {
        ...prev.rom,
        flexionDeg: flexion,
        extensionDeg: extension,
        measurementMethod: (method as any) || prev.rom.measurementMethod,
      },
    }));
  };

  const updateAssessmentMuscle = (semgPeak: number, symmetry: number, vmoVlRatio: number) => {
    setCurrentAssessment(prev => ({
      ...prev,
      muscle: {
        ...prev.muscle,
        semgPeakMicrovolts: semgPeak,
        activationSymmetryPct: symmetry,
        vmoVlRatio,
      },
    }));
  };

  const updateAssessmentFunction = (tug: number, sitToStand: number, quality: 1 | 2 | 3 | 4 | 5, notes?: string) => {
    setCurrentAssessment(prev => ({
      ...prev,
      function: {
        ...prev.function,
        timedUpAndGoSeconds: tug,
        sitToStandReps30s: sitToStand,
        movementQualityRating: quality,
        clinicalObservations: notes || prev.function.clinicalObservations,
      },
    }));
  };

  const saveAssessment = () => {
    localStorage.setItem('ns_current_assessment', JSON.stringify(currentAssessment));
    // Update patient's current metrics
    setAllPatients(prev =>
      prev.map(p =>
        p.id === activePatient.id
          ? {
              ...p,
              currentPainNprs: currentAssessment.pain.nprs,
              currentFlexionDeg: currentAssessment.rom.flexionDeg,
            }
          : p
      )
    );
  };

  // Treatment Plan updates
  const updateTreatmentPlan = (params: Partial<TreatmentParameters>) => {
    setTreatmentPlan(prev => ({
      ...prev,
      ...params,
    }));
    if (params.ch1Intensity_mA !== undefined) setCh1Active_mA(params.ch1Intensity_mA);
    if (params.ch2Intensity_mA !== undefined) setCh2Active_mA(params.ch2Intensity_mA);
  };

  const approveTreatmentAsTherapist = () => {
    const updated: TreatmentParameters = {
      ...treatmentPlan,
      therapistApproval: true,
      approvalTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTreatmentPlan(updated);
    localStorage.setItem('ns_treatment_plan', JSON.stringify(updated));
  };

  // Stimulation Controls
  const startStimulation = (): boolean => {
    if (!device.connected) {
      setSafetyAlert('Cannot start stimulation: Wearable Bluetooth device is not connected.');
      return false;
    }
    if (!treatmentPlan.therapistApproval) {
      setSafetyAlert('Therapist protocol approval required from Dr. Harshit Raj before stimulation can begin.');
      return false;
    }
    const { ch1_leadA, ch1_leadB, ch2_leadA, ch2_leadB } = device.leadStatus;
    if (
      ch1_leadA.status !== 'good' ||
      ch1_leadB.status !== 'good' ||
      ch2_leadA.status !== 'good' ||
      ch2_leadB.status !== 'good'
    ) {
      setSafetyAlert('Electrode contact impedance error: Ensure all 4 electrodes have firm conductive gel contact with clean skin.');
      return false;
    }

    setElapsedSeconds(0);
    setCh1Active_mA(treatmentPlan.ch1Intensity_mA);
    setCh2Active_mA(treatmentPlan.ch2Intensity_mA);
    setStimulationStatus('running');
    setSafetyAlert(null);
    return true;
  };

  const pauseStimulation = () => {
    setStimulationStatus('paused');
  };

  const resumeStimulation = () => {
    if (!device.connected) {
      setSafetyAlert('Device disconnected.');
      return;
    }
    setStimulationStatus('running');
  };

  const stopStimulation = () => {
    setStimulationStatus('completed');
    handleSessionCompletion();
  };

  const emergencyStop = (reason: string = 'EMERGENCY STOP TRIGGERED: Stimulation dropped to 0 mA instantly.') => {
    setStimulationStatus('emergency_stopped');
    setCh1Active_mA(0);
    setCh2Active_mA(0);
    setSafetyAlert(reason);
  };

  const adjustIntensity = (channel: 1 | 2, delta: number) => {
    if (channel === 1) {
      setCh1Active_mA(prev => {
        const next = Math.max(0, Math.min(treatmentPlan.maxTherapistAllowed_mA, prev + delta));
        return next;
      });
    } else {
      setCh2Active_mA(prev => {
        const next = Math.max(0, Math.min(treatmentPlan.maxTherapistAllowed_mA, prev + delta));
        return next;
      });
    }
  };

  const handleSessionCompletion = () => {
    setStimulationStatus('completed');
    const newRecord: SessionRecord = {
      id: `ses-${Date.now().toString().slice(-4)}`,
      patientId: activePatient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      therapistName: SUPERVISING_DOCTOR.name,
      modality: treatmentPlan.modality,
      protocolName: treatmentPlan.subType,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      avgChannel1mA: ch1Active_mA,
      avgChannel2mA: ch2Active_mA,
      prePainNprs: currentAssessment.pain.nprs,
      postPainNprs: Math.max(0, currentAssessment.pain.nprs - 1),
      preRomDeg: currentAssessment.rom.flexionDeg,
      postRomDeg: currentAssessment.rom.flexionDeg + 2,
      semgPeakMicrovolts: currentAssessment.muscle.semgPeakMicrovolts,
      exercisesCompleted: completedExercisesInSession,
      patientTolerance: 'Well Tolerated',
      therapistNotes: `Session completed successfully under ${SUPERVISING_DOCTOR.name}. No skin redness noted under electrodes. Good neuromotor recruitment.`,
      isEmergencyStopped: false,
    };

    setSessionHistory(prev => [newRecord, ...prev]);
    setLastCompletedSession(newRecord);
  };

  const addSessionRecord = (record: Omit<SessionRecord, 'id'>) => {
    const fullRecord: SessionRecord = {
      ...record,
      id: `ses-${Date.now().toString().slice(-4)}`,
    };
    setSessionHistory(prev => [fullRecord, ...prev]);
  };

  const markExerciseCompleted = (exerciseName: string) => {
    if (!completedExercisesInSession.includes(exerciseName)) {
      setCompletedExercisesInSession(prev => [...prev, exerciseName]);
    }
  };

  const clearSafetyAlert = () => {
    setSafetyAlert(null);
  };

  const startFiveStepWorkflow = () => {
    setWorkflowStep('assess');
    setCurrentView('workflow');
  };

  return (
    <NeuroStimContext.Provider
      value={{
        role,
        setRole,
        activePatient,
        setActivePatientId,
        allPatients,
        device,
        connectDevice,
        disconnectDevice,
        toggleLeadDetachmentSim,
        isScanningBle,
        setIsScanningBle,
        currentView,
        setCurrentView,
        workflowStep,
        setWorkflowStep,
        startFiveStepWorkflow,
        currentAssessment,
        updateAssessmentPain,
        updateAssessmentROM,
        updateAssessmentMuscle,
        updateAssessmentFunction,
        saveAssessment,
        treatmentPlan,
        updateTreatmentPlan,
        approveTreatmentAsTherapist,
        stimulationStatus,
        elapsedSeconds,
        remainingSeconds,
        ch1Active_mA,
        ch2Active_mA,
        nmesPhase,
        startStimulation,
        pauseStimulation,
        resumeStimulation,
        stopStimulation,
        emergencyStop,
        adjustIntensity,
        exerciseLibrary,
        activeExercise,
        setActiveExercise,
        completedExercisesInSession,
        markExerciseCompleted,
        sessionHistory,
        addSessionRecord,
        lastCompletedSession,
        safetyAlert,
        clearSafetyAlert,
      }}
    >
      {children}
    </NeuroStimContext.Provider>
  );
};

export const useNeuroStim = (): NeuroStimContextType => {
  const context = useContext(NeuroStimContext);
  if (!context) {
    throw new Error('useNeuroStim must be used within a NeuroStimProvider');
  }
  return context;
};
