import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, Receipt as ReceiptIcon, ArrowRight, Smartphone, Clock, Eye, Printer, Share2 } from 'lucide-react';
import { getDashboardStats } from '../../database/receipts';
import type { Receipt, AppSettings, ShopSettings } from '../../types';
import { PrintableReceipt } from '../../components/receipt/PrintableReceipt';
import { handleBrowserPrint, shareReceipt } from '../../services/printAndShare';

interface DashboardPageProps {
  onNewBillClick: () => void;
  onViewHistoryClick: () => void;
  shopSettings: ShopSettings;
  appSettings: AppSettings;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNewBillClick,
  onViewHistoryClick,
  shopSettings,
  appSettings
}) => {
  const [stats, setStats] = useState({
    todayCount: 0,
    todaySales: 0,
    totalCount: 0,
    totalSales: 0,
    recentReceipts: [] as Receipt[]
  });
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, <span className="text-indigo-650">{shopSettings.shopName}</span>
              </h1>
            </div>
            <p className="text-slate-650 text-sm max-w-xl">
              Create professional mobile sales receipts in seconds. Offline-first, fast, and secure.
            </p>
          </div>

          <button
            onClick={onNewBillClick}
            className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-3 text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>+ CREATE NEW BILL</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Bills</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.todayCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
              <ReceiptIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generated today</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Sales</p>
              <h3 className="text-3xl font-black text-indigo-600 font-mono mt-1">
                ₹ {stats.todaySales.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550">
            Total revenue for today
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bills</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalCount}</h3>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-sky-600">
              <ReceiptIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550">
            Stored in local database
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Turnover</p>
              <h3 className="text-3xl font-black text-slate-900 font-mono mt-1">
                ₹ {stats.totalSales.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-violet-600">
              <Smartphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-550">
            Lifetime sales total
          </div>
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ReceiptIcon className="w-5 h-5 text-indigo-600" />
              Recent Bills
            </h2>
            <p className="text-xs text-slate-500">Latest customer mobile sales</p>
          </div>
          <button
            onClick={onViewHistoryClick}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentReceipts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <Smartphone className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-base">No Bills Created Yet</h3>
            <p className="text-slate-550 text-xs mt-1 mb-4 max-w-sm mx-auto">
              Click the New Bill button to create your first branded mobile sale receipt.
            </p>
            <button
              onClick={onNewBillClick}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              + Create First Bill
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {stats.recentReceipts.map((receipt) => (
              <div key={receipt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 rounded-lg px-3 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {receipt.billNumber.replace('SM-', '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {receipt.items && receipt.items.length > 0 ? receipt.items[0].mobileModel : receipt.mobileModel}
                      </span>
                      {receipt.items && receipt.items.length > 1 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          +{receipt.items.length - 1} more
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-indigo-600 font-semibold">{receipt.billNumber}</span>
                    </div>
                    <div className="text-xs text-slate-550 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span>{receipt.customerName}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        IMEI: {receipt.items && receipt.items.length > 0 ? receipt.items[0].imei1 : receipt.imei1}
                        {receipt.items && receipt.items.length > 1 && ` (+${receipt.items.length - 1})`}
                      </span>
                      <span>•</span>
                      <span>{receipt.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="font-mono font-black text-indigo-700 text-base">
                    ₹ {Number(receipt.price).toLocaleString('en-IN')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="p-2 text-slate-550 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ReceiptIcon className="w-4 h-4 text-indigo-600" />
                Receipt Preview - {selectedReceipt.billNumber}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-550 hover:text-slate-800 text-sm font-bold px-2 py-1 rounded-md"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto bg-slate-100 flex-1">
              <PrintableReceipt
                receipt={selectedReceipt}
                shopSettings={shopSettings}
                appSettings={appSettings}
                isPreview={true}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleBrowserPrint()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>

              <button
                onClick={() => shareReceipt(selectedReceipt)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 rounded-lg font-bold text-xs flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
