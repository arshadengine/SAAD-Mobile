import React, { useState, useEffect } from 'react';
import { searchReceipts, deleteReceipt } from '../../database/receipts';
import type { Receipt, ShopSettings, AppSettings } from '../../types';
import { PrintableReceipt } from '../../components/receipt/PrintableReceipt';
import { handleBrowserPrint, generateReceiptPDF, shareReceipt } from '../../services/printAndShare';
import { Search, FileText, Eye, Printer, Download, Share2, Trash2, Calendar, Phone, Hash, Smartphone } from 'lucide-react';

interface BillsPageProps {
  shopSettings: ShopSettings;
  appSettings: AppSettings;
}

export const BillsPage: React.FC<BillsPageProps> = ({ shopSettings, appSettings }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    loadReceipts();
  }, [searchQuery]);

  const loadReceipts = async () => {
    const data = await searchReceipts(searchQuery);
    setReceipts(data);
  };

  const handleDelete = async (id: number, billNumber: string) => {
    if (window.confirm(`Are you sure you want to delete receipt ${billNumber}? This action cannot be undone.`)) {
      await deleteReceipt(id);
      if (selectedReceipt?.id === id) {
        setSelectedReceipt(null);
      }
      loadReceipts();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Receipt History
          </h1>
          <p className="text-xs text-slate-550">Search, view, print, or share previous bills</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search Bill #, Name, Phone, IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-slate-800 font-bold text-base">No Receipts Found</h3>
            <p className="text-slate-650 text-xs mt-1">
              {searchQuery ? `No matches for "${searchQuery}"` : 'No generated receipts stored in local memory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-3 font-bold">Bill #</th>
                  <th className="py-3 px-3 font-bold">Date & Time</th>
                  <th className="py-3 px-3 font-bold">Customer</th>
                  <th className="py-3 px-3 font-bold">Mobile Model</th>
                  <th className="py-3 px-3 font-bold">IMEI</th>
                  <th className="py-3 px-3 font-bold text-right">Price</th>
                  <th className="py-3 px-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 text-xs">
                      {receipt.billNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-650 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-450" />
                        <span>{receipt.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-450 mt-0.5">{receipt.time}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-medium text-xs">
                      <div>{receipt.customerName}</div>
                      {receipt.customerPhone && (
                        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {receipt.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                        {receipt.mobileModel}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        {receipt.imei1}
                      </div>
                      {receipt.imei2 && <div className="text-[10px] text-slate-450">IMEI 2: {receipt.imei2}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-right text-sm">
                      ₹ {Number(receipt.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setTimeout(() => handleBrowserPrint(), 100);
                          }}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateReceiptPDF(receipt)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareReceipt(receipt)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Share Receipt"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        {receipt.id && (
                          <button
                            onClick={() => handleDelete(receipt.id!, receipt.billNumber)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Receipt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View/Print Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Receipt Detail - {selectedReceipt.billNumber}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-550 hover:text-slate-800 text-sm font-bold px-2 py-1 rounded-md cursor-pointer"
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
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                Print
              </button>

              <button
                onClick={() => generateReceiptPDF(selectedReceipt)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                Download PDF
              </button>

              <button
                onClick={() => shareReceipt(selectedReceipt)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-150 hover:bg-indigo-100 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
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
