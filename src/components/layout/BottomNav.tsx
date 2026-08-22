import React from 'react';
import { Smartphone, PlusCircle, FileText, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'new-bill' | 'bills' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'new-bill' | 'bills' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 print:hidden shadow-lg">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('new-bill')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'new-bill' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <div className="p-1 rounded-full bg-indigo-600 text-white shadow-md">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-indigo-600">New Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'bills' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'settings' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </div>
    </div>
  );
};
