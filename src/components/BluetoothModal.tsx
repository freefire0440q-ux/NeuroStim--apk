/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bluetooth Device Connection & Telemetry Interface
 */

import React, { useState } from 'react';
import {
  X,
  Bluetooth,
  RefreshCw,
  Battery,
  BatteryCharging,
  Wifi,
  Cpu,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Sliders,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';
import {
  isWebBluetoothSupported,
  NEARBY_DISCOVERABLE_DEVICES,
  requestRealBluetoothDevice,
} from '../services/bluetoothService';

interface BluetoothModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BluetoothModal: React.FC<BluetoothModalProps> = ({ isOpen, onClose }) => {
  const {
    device,
    connectDevice,
    disconnectDevice,
    toggleLeadDetachmentSim,
    isScanningBle,
    setIsScanningBle,
  } = useNeuroStim();

  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [hardwareAttemptError, setHardwareAttemptError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanDevices = () => {
    setIsScanningBle(true);
    setScanMessage('Scanning for nearby NeuroStim BLE pods...');
    setTimeout(() => {
      setIsScanningBle(false);
      setScanMessage('Scan complete. 3 compatible pods discovered.');
    }, 1800);
  };

  const handlePairHardwareDevice = async () => {
    setHardwareAttemptError(null);
    const result = await requestRealBluetoothDevice();
    if (result.success) {
      connectDevice(result.deviceName || 'NeuroStim Hardware Device');
    } else {
      setHardwareAttemptError(result.error || 'Hardware pairing not completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B132B] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Wireless Device Management</h2>
              <p className="text-xs text-slate-400">Bluetooth Low Energy (BLE 5.3) Wearable Pod</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Mode Distinction Callout Banner (Requirement §12) */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Hardware Status: {device.isSimulated ? 'Interactive Telemetry Simulation Active' : 'Real Hardware Connected'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              NeuroStim+ clearly distinguishes simulated wearable telemetry from physical hardware. The integrated interactive pod simulator replicates full 6-axis IMU movement, live electrode impedance, and battery discharge for testing and university demonstration.
            </p>
          </div>

          {/* Connected Device Card or Disconnected State */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{device.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-700/40">
                    {device.model}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  MAC: {device.macAddress} · FW: {device.firmwareVersion}
                </p>
              </div>

              {device.connected ? (
                <button
                  onClick={disconnectDevice}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connectDevice('pod-pro-a14')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/50 hover:bg-cyan-900/40 transition-colors"
                >
                  Reconnect Pod
                </button>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  {device.isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Battery</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {device.connected ? `${device.batteryPercentage}%` : '--'}
                </div>
                <span className="text-[10px] text-emerald-400">Optimal (~4.5 hrs)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Wifi className="w-3.5 h-3.5 text-teal-400" />
                  <span>BLE Signal</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {device.connected ? `${device.rssiDbm} dBm` : '--'}
                </div>
                <span className="text-[10px] text-teal-400">Excellent Range</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>IMU Angle</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {device.connected ? `${device.imu.jointAngle}°` : '--'}
                </div>
                <span className="text-[10px] text-slate-400">Knee Flexion</span>
              </div>
            </div>
          </div>

          {/* Electrode Contact Impedance Check (Safety §6 & §11) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Electrode Lead Contact Status & Impedance
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Threshold: &lt;1,000 Ω</span>
            </div>

            <p className="text-xs text-slate-400">
              Real-time skin impedance test. Click any electrode below to simulate a lead detachment to test the automated instant safety cutoff.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { key: 'ch1_leadA', label: 'CH1 Lead A (+)', sub: 'Proximal VMO' },
                { key: 'ch1_leadB', label: 'CH1 Lead B (-)', sub: 'Distal VMO' },
                { key: 'ch2_leadA', label: 'CH2 Lead A (+)', sub: 'Rectus Femoris' },
                { key: 'ch2_leadB', label: 'CH2 Lead B (-)', sub: 'Lateral Quad' },
              ].map(item => {
                const lead = device.leadStatus[item.key as keyof typeof device.leadStatus];
                const isGood = lead.status === 'good';
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleLeadDetachmentSim(item.key as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isGood
                        ? 'bg-slate-950/70 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">{item.label}</span>
                      {isGood ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      )}
                    </div>
                    <div className="font-mono text-xs font-semibold mt-1 text-white">
                      {isGood ? `${lead.impedance} Ω` : 'DETACHED'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Movement Sensor 6-Axis IMU Stream */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Wearable 6-Axis IMU Sensor Telemetry
                </h3>
              </div>
              <span className="text-[11px] text-teal-400 font-mono">Stream 50Hz</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Pitch</div>
                <div className="font-mono font-bold text-white mt-0.5">{device.imu.pitch}°</div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Roll</div>
                <div className="font-mono font-bold text-white mt-0.5">{device.imu.roll}°</div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Acceleration</div>
                <div className="font-mono font-bold text-white mt-0.5">{device.imu.accMagnitude} g</div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Gyro Rate</div>
                <div className="font-mono font-bold text-white mt-0.5">{device.imu.gyroRate} °/s</div>
              </div>
            </div>
          </div>

          {/* Search for Nearby Wearable Pods */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Discover Nearby NeuroStim Pods
              </h3>
              <button
                onClick={handleScanDevices}
                disabled={isScanningBle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningBle ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isScanningBle ? 'Scanning...' : 'Scan Nearby'}</span>
              </button>
            </div>

            {scanMessage && <p className="text-xs text-cyan-400 font-medium">{scanMessage}</p>}

            <div className="space-y-2">
              {NEARBY_DISCOVERABLE_DEVICES.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.model} · Rec: {p.recommendedLocation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">{p.battery}% batt</span>
                    <button
                      onClick={() => connectDevice(p.id)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-700/50 hover:bg-cyan-900/50"
                    >
                      {device.id === p.id && device.connected ? 'Active' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Web Bluetooth Browser Trigger */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <p>Hardware Web Bluetooth: {isWebBluetoothSupported() ? 'Supported in browser' : 'Requires Chrome/Edge'}</p>
              {hardwareAttemptError && (
                <p className="text-rose-400 text-[11px] mt-0.5">{hardwareAttemptError}</p>
              )}
            </div>
            <button
              onClick={handlePairHardwareDevice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            >
              <span>Pair Physical BLE Device</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
