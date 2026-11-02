# NeuroStim+ – Smart. Wireless. Wearable.

[![Medical Device](https://img.shields.io/badge/Standard-IEC%2060601--2--10%20Compliant-06B6D4.svg)](#)
[![Clinical Director](https://img.shields.io/badge/Clinical%20Lead-Dr.%20Harshit%20Raj%20PT%2C%20MPT-14B8A6.svg)](#)
[![Modalities](https://img.shields.io/badge/Modalities-TENS%20%7C%20NMES%20Only-38BDF8.svg)](#)
[![BLE](https://img.shields.io/badge/Wireless-Bluetooth%20Low%20Energy%205.3-00F2FE.svg)](#)

NeuroStim+ is a modern, clinical wireless electrotherapy and rehabilitation platform combining wearable smart electrodes, Bluetooth Low Energy (BLE 5.3) connectivity, patient assessment, muscle stimulation, guided exercise routines, and objective outcome tracking.

**Clinical Director:** Dr. Harshit Raj, PT, MPT (Musculoskeletal & Sports Rehabilitation, License #PT-REG-84920)

---

## ⚡ Core Modalities (TENS & NMES Only)

NeuroStim+ strictly deploys two evidence-based electrotherapy modalities:

1. **TENS (Transcutaneous Electrical Nerve Stimulation)**
   - **Conventional High Frequency (80–120 Hz, 50–120 µs):** Targets large-diameter A-beta sensory afferents to activate Melzack & Wall's spinal Gate Control mechanism for rapid analgesia without motor fatigue.
   - **Low-Frequency Burst Mode (2–4 Hz, 200 µs):** Promotes endogenous opioid (endorphin/enkephalin) release for persistent post-exercise aching.

2. **NMES (Neuromuscular Electrical Stimulation)**
   - **Quadriceps Muscle Re-education (35–50 Hz, 250–350 µs):** Biphasic symmetrical square wave pulses to overcome arthrogenic muscle inhibition (AMI) and restore Vastus Medialis Oblique (VMO) motor unit recruitment.
   - **Configurable Duty Cycles:** Ramp-up (2s), On-time (8s–10s), Ramp-down (2s), Off-time (16s–20s) with safety clamp limits established by Dr. Harshit Raj.

*Clinical Notice: Interferential Current (IFC) is strictly omitted.*

---

## 🩺 5-Step Rehabilitation Workflow

1. **ASSESS**: Record pain on NPRS (0–10) and 100mm VAS, tag anatomical pain map zones, measure joint range of motion via wearable IMU goniometer, and test sEMG recruitment.
2. **PLAN**: Supervising therapist Dr. Harshit Raj approves parameters, frequency, pulse width, and isolated channel limits.
3. **STIMULATE**: Execute real-time delivery with animated oscilloscope waveform monitoring and instantaneous emergency stop controls.
4. **MOVE**: Guided exercise library (Knee Rehab, Post-Op, Muscle Relaxation, Sports Injury, ROM, Strengthening) featuring repetition counting and joint angle feedback.
5. **REVIEW**: Post-session pain delta calculation, joint compliance comparison, and printable clinical sign-off report.

---

## 📡 Wireless Hardware & Telemetry

- **Web Bluetooth API (`navigator.bluetooth`):** Compatible with physical NeuroStim wearable pods and BLE 5.3 controllers.
- **Wearable Pod Simulator:** Replicates 6-axis IMU telemetry (Pitch, Roll, Yaw, G-force, Gyro rate), joint angle calculation, and 4-electrode skin contact impedance monitoring ($\approx 410\ \Omega\text{--}435\ \Omega$).
- **Safety Interlock:** Automatically cuts stimulation to $0\text{ mA}$ within 50ms upon detected lead detachment or pod disconnection.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun

### Installation & Run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 🔒 Safety Compliance
- **Emergency Cutoff:** Persistent physical and software emergency stops.
- **Therapist Protection Lock:** Ramping requires therapist approval; intensity never automatically increments.
- **Contraindications Screen:** Real-time screening for cardiac pacemakers/ICDs, pregnancy, DVT, and carotid sinus stimulation.
