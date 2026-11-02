/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NeuroStim+ Bluetooth Low Energy (BLE) & Wearable Pod Service
 * Provides Web Bluetooth API integration with dual-mode simulation for testing.
 */

import { BluetoothDevice, IMUTelemetry, LeadContactStatus } from '../types';

export const BLE_NEUROSTIM_SERVICE_UUID = '0000fe40-0000-1000-8000-00805f9b34fb';
export const BLE_TELEMETRY_CHAR_UUID = '0000fe41-0000-1000-8000-00805f9b34fb';
export const BLE_CONTROL_CHAR_UUID = '0000fe42-0000-1000-8000-00805f9b34fb';

export const INITIAL_DEVICE_STATE: BluetoothDevice = {
  id: 'pod-pro-a14',
  name: 'NeuroStim Pod Pro (Left Knee)',
  model: 'NS-POD-X3 Gen 2',
  macAddress: 'C4:58:A2:89:14:FE',
  firmwareVersion: 'v2.4.1-BLE5.3',
  connected: true,
  batteryPercentage: 86,
  isCharging: false,
  rssiDbm: -58,
  isSimulated: true, // Clearly stated to the user
  leadStatus: {
    ch1_leadA: { impedance: 420, status: 'good' },
    ch1_leadB: { impedance: 410, status: 'good' },
    ch2_leadA: { impedance: 435, status: 'good' },
    ch2_leadB: { impedance: 425, status: 'good' },
  },
  imu: {
    pitch: 18.4,
    roll: -2.1,
    yaw: 4.8,
    accMagnitude: 1.02,
    gyroRate: 0.4,
    jointAngle: 118,
  },
  lastSync: 'Just now',
};

export const NEARBY_DISCOVERABLE_DEVICES = [
  {
    id: 'pod-pro-a14',
    name: 'NeuroStim Pod Pro #A14',
    model: 'NS-POD-X3 (Dual Channel)',
    rssiDbm: -58,
    battery: 86,
    recommendedLocation: 'Left Knee Quadriceps / VMO',
  },
  {
    id: 'pod-lite-b02',
    name: 'NeuroStim Pod Lite #B02',
    model: 'NS-POD-LT (Single Channel)',
    rssiDbm: -72,
    battery: 94,
    recommendedLocation: 'Right Shoulder / Rotator Cuff',
  },
  {
    id: 'pod-pro-c07',
    name: 'NeuroStim Pod Pro #C07',
    model: 'NS-POD-X3 (Dual Channel)',
    rssiDbm: -84,
    battery: 62,
    recommendedLocation: 'Lumbar / Paraspinal',
  },
];

/**
 * Checks if the Web Bluetooth API is supported by the current browser environment.
 */
export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Requests real Web Bluetooth pairing if supported in the browser.
 */
export async function requestRealBluetoothDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  if (!isWebBluetoothSupported()) {
    return {
      success: false,
      error: 'Web Bluetooth API is not supported in this browser. Please use Chrome/Edge or switch to the high-fidelity Wearable Pod Simulator.',
    };
  }

  try {
    const nav = navigator as unknown as {
      bluetooth: {
        requestDevice: (options: {
          acceptAllDevices?: boolean;
          filters?: Array<{ namePrefix?: string; services?: string[] }>;
          optionalServices?: string[];
        }) => Promise<{ id: string; name?: string; gatt?: { connect: () => Promise<unknown> } }>;
      };
    };

    const device = await nav.bluetooth.requestDevice({
      filters: [{ namePrefix: 'NeuroStim' }, { namePrefix: 'NS-' }],
      optionalServices: [BLE_NEUROSTIM_SERVICE_UUID, 'battery_service'],
    });

    return {
      success: true,
      deviceName: device.name || 'NeuroStim Hardware Device',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'User cancelled device selection or device is unavailable.';
    return {
      success: false,
      error: errorMsg,
    };
  }
}
