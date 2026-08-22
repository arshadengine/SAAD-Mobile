import React, { useState, useEffect } from 'react';
import { initDatabase } from './database/db';
import { getShopSettings, getAppSettings } from './database/settings';
import type { ShopSettings, AppSettings } from './types';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { NewBillPage } from './pages/NewBill/NewBillPage';
import { BillsPage } from './pages/Bills/BillsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-bill' | 'bills' | 'settings'>('dashboard');
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadApp();
  }, []);

  const loadApp = async () => {
    try {
      await initDatabase();
      const shop = await getShopSettings();
      const app = await getAppSettings();
      setShopSettings(shop);
      setAppSettings(app);
    } catch (err) {
      console.error('Failed to initialize local database:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  if (!isLoaded || !shopSettings || !appSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="SAAD Mobile" className="h-16 w-auto animate-pulse" />
          <div className="text-indigo-600 font-bold text-lg tracking-wider uppercase">Loading SAAD Mobile POS...</div>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-indigo-600 rounded-full animate-indeterminate"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-6">
      {/* Top POS Header */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={shopSettings.shopName}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNewBillClick={() => setActiveTab('new-bill')}
            onViewHistoryClick={() => setActiveTab('bills')}
            shopSettings={shopSettings}
            appSettings={appSettings}
          />
        )}

        {activeTab === 'new-bill' && (
          <NewBillPage
            shopSettings={shopSettings}
            appSettings={appSettings}
            onBillCreated={() => {
              // Stay on page to allow print/share or click fresh bill
            }}
          />
        )}

        {activeTab === 'bills' && (
          <BillsPage
            shopSettings={shopSettings}
            appSettings={appSettings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            shopSettings={shopSettings}
            appSettings={appSettings}
            onSettingsUpdated={loadApp}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default App;
