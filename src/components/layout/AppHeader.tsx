import React from 'react';
import { Smartphone, PlusCircle, FileText, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'new-bill' | 'bills' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'new-bill' | 'bills' | 'settings') => void;
  shopName: string;
}

export const AppHeader: React.FC<HeaderProps> = ({ activeTab, setActiveTab, shopName }) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 print:hidden shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img src="/logo.png" alt="SAAD Mobile" className="h-10 w-auto object-contain rounded-full bg-indigo-50 p-0.5 border border-indigo-200" />
            <div>
              <span className="font-extrabold text-lg tracking-wider text-indigo-900 uppercase">
                {shopName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                POS Billing
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-250 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`} />
              Overview
            </button>

            <button
              onClick={() => setActiveTab('new-bill')}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 border ${
                activeTab === 'new-bill'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-black'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500 font-bold'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              + New Bill
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                activeTab === 'bills'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-250 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'bills' ? 'text-indigo-600' : 'text-slate-500'}`} />
              Bill History
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-250 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-500'}`} />
              Settings
            </button>
          </nav>

          {/* Local Security Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-slate-600 text-xs bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Local & Offline First</span>
          </div>
        </div>
      </div>
    </header>
  );
};
