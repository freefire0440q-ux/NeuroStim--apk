/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mobile Bottom Tab Bar for NeuroStim+
 */

import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  ClipboardList,
  Zap,
  Dumbbell,
  LineChart,
} from 'lucide-react';
import { useNeuroStim } from '../context/NeuroStimContext';

export const BottomTabBar: React.FC = () => {
  const { currentView, setCurrentView } = useNeuroStim();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflow', label: '5-Step Flow', icon: GitFork },
    { id: 'assessment', label: 'Assess', icon: ClipboardList },
    { id: 'treatment', label: 'Stimulate', icon: Zap },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: LineChart },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070D1E]/95 backdrop-blur-md border-t border-slate-800/80 px-2 pb-safe">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] font-medium tracking-tight mt-1 truncate ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
