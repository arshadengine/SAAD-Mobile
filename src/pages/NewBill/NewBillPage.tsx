import React, { useState, useEffect } from 'react';
import { getNextBillNumber, createReceipt } from '../../database/receipts';
import type { ShopSettings, AppSettings, Receipt, ReceiptItem } from '../../types';
import { PrintableReceipt } from '../../components/receipt/PrintableReceipt';
import { handleBrowserPrint, generateReceiptPDF, shareReceipt } from '../../services/printAndShare';
import {
  Smartphone,
  User,
  Hash,
  IndianRupee,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Trash2,
  Calculator
} from 'lucide-react';

interface NewBillPageProps {
  shopSettings: ShopSettings;
  appSettings: AppSettings;
  onBillCreated: () => void;
}

interface MobileItemInput {
  id: string;
  mobileModel: string;
  ramStorage: string;
  color: string;
  imei1: string;
  imei2: string;
  price: string;
  quantity: number;
}

const createEmptyItem = (): MobileItemInput => ({
  id: Math.random().toString(36).substring(2, 9),
  mobileModel: '',
  ramStorage: '',
  color: '',
  imei1: '',
  imei2: '',
  price: '',
  quantity: 1
});

export const NewBillPage: React.FC<NewBillPageProps> = ({
  shopSettings,
  appSettings,
  onBillCreated
}) => {
  const [billNumber, setBillNumber] = useState<string>('SM-000001');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  const [items, setItems] = useState<MobileItemInput[]>([createEmptyItem()]);

  const [salesType, setSalesType] = useState<string>('Retail');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [discount, setDiscount] = useState<string>('0');
  const [tax, setTax] = useState<string>('0');

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

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`item_${index}_`)) {
          delete next[k];
        }
      });
      return next;
    });
  };

  const handleUpdateItem = (index: number, field: keyof MobileItemInput, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  // Subtotal & Grand Total
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1), 0);
  const discountVal = Number(discount) || 0;
  const taxVal = Number(tax) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal + taxVal);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (customerPhone.trim() && !/^[6-9]\d{9}$/.test(customerPhone.trim())) {
      newErrors.customerPhone = 'Enter valid 10-digit Indian mobile number';
    }

    items.forEach((item, index) => {
      const prefix = `item_${index}_`;
      if (!item.mobileModel.trim()) {
        newErrors[`${prefix}mobileModel`] = `Mobile #${index + 1} model is required`;
      }

      if (!item.imei1.trim()) {
        newErrors[`${prefix}imei1`] = `IMEI 1 is required`;
      } else if (!/^\d{15}$/.test(item.imei1.trim())) {
        newErrors[`${prefix}imei1`] = `IMEI 1 must be exactly 15 digits`;
      }

      if (item.imei2.trim() && !/^\d{15}$/.test(item.imei2.trim())) {
        newErrors[`${prefix}imei2`] = `IMEI 2 must be exactly 15 digits`;
      }

      if (!item.price || isNaN(Number(item.price)) || Number(item.price) <= 0) {
        newErrors[`${prefix}price`] = `Valid price is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const receiptItems: ReceiptItem[] = items.map((it) => ({
        id: it.id,
        mobileModel: it.mobileModel.trim(),
        ramStorage: it.ramStorage.trim() || undefined,
        color: it.color.trim() || undefined,
        imei1: it.imei1.trim(),
        imei2: it.imei2.trim() || undefined,
        quantity: it.quantity || 1,
        price: Number(it.price)
      }));

      const receiptData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        mobileModel: receiptItems[0].mobileModel,
        ramStorage: receiptItems[0].ramStorage,
        color: receiptItems[0].color,
        imei1: receiptItems[0].imei1,
        imei2: receiptItems[0].imei2,
        price: grandTotal,
        subtotal: subtotal,
        discount: discountVal,
        tax: taxVal,
        salesType,
        paymentMethod,
        items: receiptItems,
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
    setItems([createEmptyItem()]);
    setDiscount('0');
    setTax('0');
    setSalesType('Retail');
    setPaymentMethod('Cash');
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
    mobileModel: items[0]?.mobileModel || 'Mobile Model Name',
    ramStorage: items[0]?.ramStorage || undefined,
    color: items[0]?.color || undefined,
    imei1: items[0]?.imei1 || '123456789012345',
    imei2: items[0]?.imei2 || undefined,
    price: grandTotal,
    subtotal: subtotal,
    discount: discountVal,
    tax: taxVal,
    salesType,
    paymentMethod,
    items: items.map((it, idx) => ({
      id: it.id,
      mobileModel: it.mobileModel || `Mobile Model #${idx + 1}`,
      ramStorage: it.ramStorage || undefined,
      color: it.color || undefined,
      imei1: it.imei1 || '123456789012345',
      imei2: it.imei2 || undefined,
      quantity: it.quantity || 1,
      price: Number(it.price) || 0
    }))
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
                  Bill <span className="font-mono font-bold text-indigo-700">{createdReceipt.billNumber}</span> ({items.length} {items.length === 1 ? 'mobile' : 'mobiles'}) has been saved to local database.
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
            <form onSubmit={handleCreateReceipt} className="space-y-5">
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

              {/* Mobile Products Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile Devices / Items ({items.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Add 1 or more mobiles to single bill
                  </span>
                </div>

                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 relative transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Mobile #{index + 1}
                        </span>
                        {items.length > 1 && item.mobileModel && (
                          <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[150px]">
                            ({item.mobileModel})
                          </span>
                        )}
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove this mobile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Model <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Samsung Galaxy S25 / iPhone 15"
                        value={item.mobileModel}
                        onChange={(e) => handleUpdateItem(index, 'mobileModel', e.target.value)}
                        className={`w-full bg-white border ${
                          errors[`item_${index}_mobileModel`] ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                        } rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                      />
                      {errors[`item_${index}_mobileModel`] && (
                        <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors[`item_${index}_mobileModel`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          RAM & Storage <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 8GB / 256GB"
                          value={item.ramStorage}
                          onChange={(e) => handleUpdateItem(index, 'ramStorage', e.target.value)}
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
                          value={item.color}
                          onChange={(e) => handleUpdateItem(index, 'color', e.target.value)}
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
                            value={item.imei1}
                            onChange={(e) => handleUpdateItem(index, 'imei1', e.target.value.replace(/\D/g, ''))}
                            className={`w-full bg-white border ${
                              errors[`item_${index}_imei1`] ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                            } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                          />
                          <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                        </div>
                        {errors[`item_${index}_imei1`] && (
                          <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`item_${index}_imei1`]}
                          </p>
                        )}
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
                            value={item.imei2}
                            onChange={(e) => handleUpdateItem(index, 'imei2', e.target.value.replace(/\D/g, ''))}
                            className={`w-full bg-white border ${
                              errors[`item_${index}_imei2`] ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                            } rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                          />
                          <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                        </div>
                        {errors[`item_${index}_imei2`] && (
                          <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`item_${index}_imei2`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Price (₹) <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="e.g. 72999"
                            value={item.price}
                            onChange={(e) => handleUpdateItem(index, 'price', e.target.value)}
                            className={`w-full bg-white border ${
                              errors[`item_${index}_price`] ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-650'
                            } rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-indigo-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600`}
                          />
                          <IndianRupee className="w-4 h-4 text-indigo-650 absolute left-2.5 top-2.5" />
                        </div>
                        {errors[`item_${index}_price`] && (
                          <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[`item_${index}_price`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Another Mobile Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ADD ANOTHER MOBILE / ITEM</span>
                </button>
              </div>

              {/* Order Calculation & Payment Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  Bill Summary & Payment
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

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Tax (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="border border-slate-200 bg-white rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Total Items</span>
                    <span className="font-bold text-slate-900">{items.length} {items.length === 1 ? 'Mobile' : 'Mobiles'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-900">₹ {subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span className="font-mono font-bold">- ₹ {discountVal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {taxVal > 0 && (
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Tax (GST)</span>
                      <span className="font-mono font-bold">+ ₹ {taxVal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-indigo-700">
                    <span>GRAND TOTAL</span>
                    <span className="font-mono text-base font-black text-indigo-700">
                      ₹ {grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm sm:text-base tracking-wide shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? 'GENERATING RECEIPT...'
                  : `GENERATE RECEIPT (${items.length} ${items.length === 1 ? 'MOBILE' : 'MOBILES'} - ₹${grandTotal.toLocaleString('en-IN')})`}
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
              <p className="text-xs text-slate-500">Real-time shop template output ({items.length} {items.length === 1 ? 'item' : 'items'})</p>
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
