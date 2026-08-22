import React, { useState } from 'react';
import type { ShopSettings, AppSettings } from '../../types';
import { updateShopSettings, updateAppSettings, exportBackupData, importBackupData, clearAllData } from '../../database/settings';
import { Settings, Store, Receipt as ReceiptIcon, Database, Download, Upload, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SettingsPageProps {
  shopSettings: ShopSettings;
  appSettings: AppSettings;
  onSettingsUpdated: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  shopSettings,
  appSettings,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'receipt' | 'data'>('profile');

  // Shop Profile Form State
  const [shopName, setShopName] = useState(shopSettings.shopName);
  const [tagline, setTagline] = useState(shopSettings.tagline);
  const [address, setAddress] = useState(shopSettings.address);
  const [phone, setPhone] = useState(shopSettings.phone);
  const [whatsapp, setWhatsapp] = useState(shopSettings.whatsapp);
  const [gstin, setGstin] = useState(shopSettings.gstin || '');
  const [logoUrl, setLogoUrl] = useState(shopSettings.logoUrl || '/logo.png');

  // Receipt Settings Form State
  const [billPrefix, setBillPrefix] = useState(appSettings.billPrefix);
  const [receiptFooterMsg, setReceiptFooterMsg] = useState(shopSettings.receiptFooterMsg);
  const [showCustomerPhone, setShowCustomerPhone] = useState(appSettings.showCustomerPhone);
  const [showGstin, setShowGstin] = useState(appSettings.showGstin);
  const [showImei2, setShowImei2] = useState(appSettings.showImei2);
  const [receiptSize, setReceiptSize] = useState(appSettings.receiptSize);

  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShopSettings({
      shopName: shopName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      gstin: gstin.trim(),
      logoUrl: logoUrl.trim()
    });
    onSettingsUpdated();
    showToast('Shop profile updated successfully!');
  };

  const handleSaveReceiptSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShopSettings({
      receiptFooterMsg: receiptFooterMsg.trim()
    });
    await updateAppSettings({
      billPrefix: billPrefix.trim() || 'SM-',
      showCustomerPhone,
      showGstin,
      showImei2,
      receiptSize
    });
    onSettingsUpdated();
    showToast('Receipt customization updated!');
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = async () => {
    const jsonStr = await exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saad-mobile-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importBackupData(content);
        if (success) {
          onSettingsUpdated();
          showToast('Data imported and restored successfully!');
        } else {
          alert('Failed to import backup file. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('WARNING: This will erase all local receipt history and reset settings to defaults. Are you sure?')) {
      await clearAllData();
      onSettingsUpdated();
      showToast('All local data cleared!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Shop & App Settings
          </h1>
          <p className="text-xs text-slate-550">Manage profile details, receipt layout, and local data backups</p>
        </div>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          Shop Profile
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'receipt'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptIcon className="w-4 h-4" />
          Receipt Customization
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'data'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Data & Backup
        </button>
      </div>

      {/* Tab 1: Shop Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL or Path</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">Default is set to official <code className="text-indigo-600 font-semibold bg-slate-100 px-1 py-0.5 rounded">/logo.png</code></p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Save Profile Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Receipt Customization */}
      {activeTab === 'receipt' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSaveReceiptSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bill Number Prefix</label>
                <input
                  type="text"
                  value={billPrefix}
                  onChange={(e) => setBillPrefix(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-indigo-700 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Example: SM- for SM-000001</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Format Size</label>
                <select
                  value={receiptSize}
                  onChange={(e) => setReceiptSize(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-semibold"
                >
                  <option value="A4">A4 / Standard Full Page</option>
                  <option value="A5">A5 / Half Page</option>
                  <option value="80mm">80mm Thermal Receipt</option>
                  <option value="58mm">58mm Small Thermal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={receiptFooterMsg}
                onChange={(e) => setReceiptFooterMsg(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Options</label>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showCustomerPhone"
                  checked={showCustomerPhone}
                  onChange={(e) => setShowCustomerPhone(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-650 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="showCustomerPhone" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Show customer phone number on printed receipt
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showGstin"
                  checked={showGstin}
                  onChange={(e) => setShowGstin(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-650 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="showGstin" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Show GSTIN in receipt header (if provided)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showImei2"
                  checked={showImei2}
                  onChange={(e) => setShowImei2(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-650 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="showImei2" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Show IMEI 2 line on receipt (if entered)
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Save Receipt Layout Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Data & Backup */}
      {activeTab === 'data' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-605" />
              Export Backup
            </h3>
            <p className="text-xs text-slate-650 mb-3">
              Download your entire receipt history and shop settings into a single offline JSON file for safety.
            </p>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Backup (.json)
            </button>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-605" />
              Restore Backup
            </h3>
            <p className="text-xs text-slate-650 mb-3">
              Select a previously saved <code className="text-indigo-600 font-semibold bg-slate-105 px-1 py-0.5 rounded">saad-mobile-backup-*.json</code> file to restore your database.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 transition-colors">
              <Upload className="w-4 h-4 text-indigo-650" />
              Import Backup File
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-rose-600 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reset Local Storage
            </h3>
            <p className="text-xs text-slate-650 mb-3">
              Clear all locally stored receipts and reset shop configuration.
            </p>
            <button
              onClick={handleClearData}
              className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Local Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
