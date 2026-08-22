import React, { useState, useEffect } from 'react';
import { getNextBillNumber, createReceipt } from '../../database/receipts';
import type { ShopSettings, AppSettings, Receipt } from '../../types';
import { PrintableReceipt } from '../../components/receipt/PrintableReceipt';
import { handleBrowserPrint, generateReceiptPDF, shareReceipt } from '../../services/printAndShare';
import { Smartphone, User, Hash, IndianRupee, Printer, Download, Share2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface NewBillPageProps {
  shopSettings: ShopSettings;
  appSettings: AppSettings;
  onBillCreated: () => void;
}

export const NewBillPage: React.FC<NewBillPageProps> = ({
  shopSettings,
  appSettings,
  onBillCreated
}) => {
  const [billNumber, setBillNumber] = useState<string>('SM-000001');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [mobileModel, setMobileModel] = useState<string>('');
  const [ramStorage, setRamStorage] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [salesType, setSalesType] = useState<string>('Retail');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [imei1, setImei1] = useState<string>('');
  const [imei2, setImei2] = useState<string>('');

  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchNextBillNum();
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTimestamp = () => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
    setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
  };

  const fetchNextBillNum = async () => {
    const next = await getNextBillNumber();
    setBillNumber(next.billNumber);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!mobileModel.trim()) {
      newErrors.mobileModel = 'Mobile model is required';
    }

    if (!imei1.trim()) {
      newErrors.imei1 = 'IMEI 1 is required';
    } else if (!/^\d{15}$/.test(imei1.trim())) {
      newErrors.imei1 = 'IMEI 1 must be exactly 15 digits';
    }

    if (imei2.trim() && !/^\d{15}$/.test(imei2.trim())) {
      newErrors.imei2 = 'IMEI 2 must be exactly 15 digits';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Valid sale price is required';
    }

    if (customerPhone.trim() && !/^[6-9]\d{9}$/.test(customerPhone.trim())) {
      newErrors.customerPhone = 'Enter valid 10-digit Indian mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const receiptData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        mobileModel: mobileModel.trim(),
        ramStorage: ramStorage.trim() || undefined,
        color: color.trim() || undefined,
        price: Number(price),
        salesType,
        paymentMethod,
        imei1: imei1.trim(),
        imei2: imei2.trim() || undefined,
        date: dateStr,
        time: timeStr
      };

      const saved = await createReceipt(receiptData);
      setCreatedReceipt(saved);
      onBillCreated();
    } catch (err) {
      console.error('Failed to create receipt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setMobileModel('');
    setRamStorage('');
    setColor('');
    setPrice('');
    setSalesType('Retail');
    setPaymentMethod('Cash');
    setImei1('');
    setImei2('');
    setErrors({});
    setCreatedReceipt(null);
    fetchNextBillNum();
  };

  // Draft receipt for real-time live preview
  const draftReceipt: Receipt = {
    billNumber,
    date: dateStr,
    time: timeStr,
    timestamp: Date.now(),
    customerName: customerName || 'Customer Name',
    customerPhone: customerPhone || undefined,
    customerAddress: customerAddress || undefined,
    mobileModel: mobileModel || 'Mobile Model Name',
    ramStorage: ramStorage || undefined,
    color: color || undefined,
    price: Number(price) || 0,
    salesType,
    paymentMethod,
    imei1: imei1 || '123456789012345',
    imei2: imei2 || undefined
  };

  const currentDisplayReceipt = createdReceipt || draftReceipt;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm print:hidden">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                New Bill Entry
              </h2>
              <p className="text-xs text-slate-500">Fill in details to generate instant receipt</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-indigo-700 font-semibold block uppercase">Bill Number</span>
              <span className="font-mono font-extrabold text-indigo-800 text-sm tracking-wider">{billNumber}</span>
            </div>
          </div>

          {createdReceipt ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Receipt Generated Successfully!</h3>
                <p className="text-slate-700 text-xs mt-1">
                  Bill <span className="font-mono font-bold text-indigo-700">{createdReceipt.billNumber}</span> has been saved to local database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => handleBrowserPrint()}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={() => generateReceiptPDF(createdReceipt)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => shareReceipt(createdReceipt)}
                  className="px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              <button
                onClick={resetForm}
                className="w-full mt-2 py-3 bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                Create Another Bill
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateReceipt} className="space-y-4">
              {/* Customer Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Customer Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full bg-white border ${
                      errors.customerName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                    } rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                  />
                  {errors.customerName && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className={`w-full bg-white border ${
                      errors.customerPhone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                    } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                  />
                  {errors.customerPhone && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.customerPhone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Enter customer address"
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Mobile Product Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile Sale Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Model <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S25"
                    value={mobileModel}
                    onChange={(e) => setMobileModel(e.target.value)}
                    className={`w-full bg-white border ${
                      errors.mobileModel ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                    } rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                  />
                  {errors.mobileModel && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.mobileModel}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      RAM & Storage <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8GB / 256GB"
                      value={ramStorage}
                      onChange={(e) => setRamStorage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Color <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Phantom Black"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      IMEI Number 1 <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="15 digits IMEI"
                        maxLength={15}
                        value={imei1}
                        onChange={(e) => setImei1(e.target.value.replace(/\D/g, ''))}
                        className={`w-full bg-white border ${
                          errors.imei1 ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                        } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                      />
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                    {errors.imei1 && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.imei1}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      IMEI Number 2 <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="15 digits IMEI"
                        maxLength={15}
                        value={imei2}
                        onChange={(e) => setImei2(e.target.value.replace(/\D/g, ''))}
                        className={`w-full bg-white border ${
                          errors.imei2 ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                        } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                      />
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                    {errors.imei2 && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.imei2}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 72999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full bg-white border ${
                        errors.price ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                      } rounded-lg pl-8 pr-3 py-2.5 text-base font-bold text-indigo-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                    />
                    <IndianRupee className="w-4 h-4 text-indigo-650 absolute left-2.5 top-3" />
                  </div>
                  {errors.price && <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.price}</p>}
                </div>
              </div>

              {/* Sale & Payment Details Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Sale & Payment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sales Type
                    </label>
                    <select
                      value={salesType}
                      onChange={(e) => setSalesType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600 font-semibold"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Wholesale">Wholesale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600 font-semibold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base tracking-wide shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'GENERATING RECEIPT...' : 'GENERATE RECEIPT NOW'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Real-Time Live Receipt Preview */}
        <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-200 print:hidden">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Receipt Preview
              </h2>
              <p className="text-xs text-slate-500">Real-time shop template output</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBrowserPrint()}
                className="p-2 text-slate-650 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto p-2 bg-slate-100 rounded-xl border border-slate-200">
            <PrintableReceipt
              receipt={currentDisplayReceipt}
              shopSettings={shopSettings}
              appSettings={appSettings}
              isPreview={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
