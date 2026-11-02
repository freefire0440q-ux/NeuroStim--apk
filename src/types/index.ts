/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ – Smart. Wireless. Wearable.
 * Treatment Modalities: TENS and NMES only.
 */

export type UserRole = 'physiotherapist' | 'patient';

// STRICT: TENS and NMES only.
export type TreatmentModality = 'TENS' | 'NMES';

export type TENSPattern = 'conventional' | 'burst' | 'modulated';

export type NMESProtocol = 'quad_strengthening' | 'muscle_reeducation' | 'endurance' | 'recovery_pump';

export interface LeadContactStatus {
  ch1_leadA: { impedance: number; status: 'good' | 'poor' | 'disconnected' };
  ch1_leadB: { impedance: number; status: 'good' | 'poor' | 'disconnected' };
  ch2_leadA: { impedance: number; status: 'good' | 'poor' | 'disconnected' };
  ch2_leadB: { impedance: number; status: 'good' | 'poor' | 'disconnected' };
}

export interface IMUTelemetry {
  pitch: number; // degrees
  roll: number;
  yaw: number;
  accMagnitude: number; // g
  gyroRate: number; // deg/s
  jointAngle: number; // calculated flexion angle
}

export interface BluetoothDevice {
  id: string;
  name: string;
  model: string;
  macAddress: string;
  firmwareVersion: string;
  connected: boolean;
  batteryPercentage: number;
  isCharging: boolean;
  rssiDbm: number;
  isSimulated: boolean;
  leadStatus: LeadContactStatus;
  imu: IMUTelemetry;
  lastSync: string;
}

export interface PainAssessment {
  nprs: number; // 0 - 10 Numeric Pain Rating Scale
  vas: number; // 0 - 100 Visual Analogue Scale mm
  locations: string[]; // e.g. ['Knee Anterior (Patella)', 'Lateral Joint Line']
  intensity: 'Mild (1-3)' | 'Moderate (4-6)' | 'Severe (7-10)';
  irritability: 'Low' | 'Moderate' | 'High';
  aggravatingFactors: string[];
  easingFactors: string[];
}

export interface ROMAssessment {
  joint: string; // e.g. "Left Knee"
  flexionDeg: number; // 0 - 145 deg
  extensionDeg: number; // 0 to -10 deg hyperextension
  targetFlexionDeg: number;
  targetExtensionDeg: number;
  measurementMethod: 'Digital Goniometer' | 'Wearable IMU Sensor' | 'Visual Estimation';
  endFeel: 'Normal / Soft' | 'Firm Capsular' | 'Empty / Painful' | 'Bony Block';
  qualityNotes: string;
}

export interface MuscleResponseAssessment {
  targetMuscle: string; // e.g. "Vastus Medialis Oblique (VMO)"
  semgPeakMicrovolts: number; // microvolts (uV)
  activationSymmetryPct: number; // % comparison to healthy contralateral limb
  firingLatencyMs: number; // ms onset
  vmoVlRatio: number; // Vastus Medialis to Vastus Lateralis ratio (normal ~1.0)
  fatigueIndexPct: number; // %
}

export interface FunctionalMovementAssessment {
  timedUpAndGoSeconds: number; // normal <10s
  sitToStandReps30s: number; // 30 second sit to stand reps
  gaitAnalysis: 'Normal Symmetrical' | 'Antalgic / Limping' | 'Stiff Knee Gait' | 'Trendelenburg';
  movementQualityRating: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  clinicalObservations: string;
}

export interface PatientAssessment {
  id: string;
  patientId: string;
  date: string;
  therapistName: string; // Dr. Harshit Raj
  pain: PainAssessment;
  rom: ROMAssessment;
  muscle: MuscleResponseAssessment;
  function: FunctionalMovementAssessment;
}

export interface TreatmentParameters {
  modality: TreatmentModality; // 'TENS' or 'NMES'
  subType: string; // 'Conventional Gate Control', 'Russian Quad Boost', etc.
  durationMinutes: number; // 5 - 45 min
  frequencyHz: number; // 1 - 150 Hz
  pulseWidthMicroseconds: number; // 50 - 400 us
  // NMES specific duty cycle:
  rampUpSec: number;
  onTimeSec: number;
  rampDownSec: number;
  offTimeSec: number;
  // Intensity settings:
  ch1Intensity_mA: number; // 0 - 80 mA
  ch2Intensity_mA: number; // 0 - 80 mA
  maxTherapistAllowed_mA: number; // safety clamp
  targetRegion: string;
  electrodePlacementDiagram: string;
  therapistApproval: boolean;
  approvalTimestamp?: string;
  clinicalRationale: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'knee' | 'post-op' | 'relaxation' | 'sports' | 'rom' | 'strengthening';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetSets: number;
  targetReps: number;
  holdSeconds: number;
  description: string;
  instructions: string[];
  clinicalFocus: string;
  targetAngleDeg?: number;
  diagramKey: string;
  recommendedModality?: 'TENS' | 'NMES' | 'None';
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  medicalRecordNo: string;
  primaryDiagnosis: string;
  surgicalHistory: string;
  affectedLimb: 'Left Knee' | 'Right Knee' | 'Left Shoulder' | 'Right Shoulder' | 'Lumbar Spine';
  supervisingTherapist: string; // Dr. Harshit Raj
  rehabMilestone: string;
  overallRecoveryPct: number;
  totalSessionsCompleted: number;
  baselinePainNprs: number;
  currentPainNprs: number;
  baselineFlexionDeg: number;
  currentFlexionDeg: number;
  targetFlexionDeg: number;
  contraindicationsCleared: boolean;
  prescribedPlanSummary: string;
  avatarSeed: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  date: string;
  time: string;
  therapistName: string; // Dr. Harshit Raj
  modality: TreatmentModality;
  protocolName: string;
  durationMinutes: number;
  avgChannel1mA: number;
  avgChannel2mA: number;
  prePainNprs: number;
  postPainNprs: number;
  preRomDeg: number;
  postRomDeg: number;
  semgPeakMicrovolts: number;
  exercisesCompleted: string[];
  patientTolerance: 'Well Tolerated' | 'Mild Discomfort' | 'Significant Discomfort';
  therapistNotes: string;
  isEmergencyStopped: boolean;
}

export type WorkflowStep = 'assess' | 'plan' | 'stimulate' | 'move' | 'review';
