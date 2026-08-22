import React from 'react';
import type { ShopSettings, Receipt, AppSettings } from '../../types';

interface PrintableReceiptProps {
  receipt: Receipt;
  shopSettings: ShopSettings;
  appSettings: AppSettings;
  isPreview?: boolean;
}

const formatInvoiceDate = (dateStr: string) => {
  if (!dateStr) return '';
  const cleanStr = dateStr.trim();
  
  // If it's already in DD-MM-YYYY format, return it
  if (/^\d{2}-\d{2}-\d{4}$/.test(cleanStr)) {
    return cleanStr;
  }
  
  // If it contains slashes, convert to dashes
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanStr)) {
    return cleanStr.replace(/\//g, '-');
  }

  // Parse strings like "22 August 2026"
  const parts = cleanStr.split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0];
    const monthStr = parts[1].replace(/,/g, '').toLowerCase();
    const year = parts[2];
    const months: { [key: string]: string } = {
      jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
      apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
      aug: '08', august: '08', sep: '09', september: '09', oct: '10', october: '10',
      nov: '11', november: '11', dec: '12', december: '12'
    };
    const month = months[monthStr.substring(0, 3)] || '08';
    return `${day.padStart(2, '0')}-${month}-${year}`;
  }
  
  return dateStr;
};

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  receipt,
  shopSettings,
  appSettings,
  isPreview = false
}) => {
  const isThermal = appSettings.receiptSize === '58mm' || appSettings.receiptSize === '80mm';

  const formatCurrency = (val: number) => {
    return Number(val || 0).toLocaleString('en-IN');
  };

  const qty = receipt.quantity || 1;
  const unitPrice = receipt.price;
  const totalAmount = unitPrice * qty;
  const subtotal = receipt.subtotal ?? totalAmount;
  const discount = receipt.discount ?? 0;
  const tax = receipt.tax ?? 0;
  const grandTotal = subtotal - discount + tax;

  const paymentMethod = (receipt.paymentMethod || 'Cash').toLowerCase();

  const renderPaymentCheckbox = (label: string, isChecked: boolean) => (
    <div className="flex items-center gap-1.5 cursor-default">
      <div className={`w-3.5 h-3.5 border border-slate-500 rounded-sm flex items-center justify-center ${isChecked ? 'bg-[#121417] border-[#121417]' : 'bg-white'}`}>
        {isChecked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-slate-800 font-bold uppercase tracking-wider text-[11px]">{label}</span>
    </div>
  );

  return (
    <div
      id="printable-receipt-content"
      className={`bg-white text-slate-900 mx-auto font-sans leading-tight select-none border border-slate-350 shadow-md ${
        isPreview ? 'max-w-2xl rounded-sm p-0' : 'w-full max-w-2xl p-0 border-none shadow-none'
      } ${isThermal ? 'w-[80mm] text-xs p-2' : ''}`}
      style={{ colorScheme: 'light' }}
    >
      {/* Top Black Header Banner */}
      <div className="bg-[#121417] text-white p-5 relative border-b-4 border-[#d4af37]">
        <div className="flex flex-row items-center gap-5">
          {/* Logo Section */}
          <div className="shrink-0">
            {shopSettings.logoUrl ? (
              <img
                src={shopSettings.logoUrl}
                alt={shopSettings.shopName}
                className="h-24 w-24 object-contain rounded-full border-2 border-[#d4af37]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-[#d4af37] bg-black flex flex-col justify-center items-center p-2 text-center">
                <span className="text-[#d4af37] font-extrabold text-xl leading-none">SAAD</span>
                <span className="text-white text-xs font-bold tracking-widest mt-1">MOBILE</span>
              </div>
            )}
          </div>

          {/* Title & Tagline */}
          <div className="flex-1 text-center pr-6">
            <h1 className="text-3xl font-black tracking-wider text-white uppercase leading-none">
              SAAD <span className="text-[#d4af37]">MOBILE</span>
            </h1>
            
            <div className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase mt-2 flex items-center justify-center gap-2 w-full">
              <span className="h-[1px] flex-1 bg-slate-650 max-w-[80px]"></span>
              <span className="whitespace-nowrap">{shopSettings.tagline || 'MOBILE SALES & SERVICES'}</span>
              <span className="h-[1px] flex-1 bg-slate-650 max-w-[80px]"></span>
            </div>

            {/* Service Badges */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10px] text-slate-200 mt-2.5 font-medium">
              <span className="flex items-center gap-1">
                🛒 <span>NEW MOBILES</span>
              </span>
              <span className="flex items-center gap-1">
                🔧 <span>REPAIRING</span>
              </span>
              <span className="flex items-center gap-1">
                🔄 <span>EXCHANGE</span>
              </span>
              <span className="flex items-center gap-1">
                ⚙️ <span>ACCESSORIES</span>
              </span>
            </div>

            {/* Address & Contact Info */}
            <div className="flex flex-row justify-between items-start text-[10px] text-slate-350 mt-3 pt-2 border-t border-slate-800 gap-4">
              <div className="flex items-start gap-1 text-left max-w-[280px]">
                <span className="text-[#d4af37] shrink-0">📍</span>
                <span>{shopSettings.address || 'Shop No. 4, Opp. Bus Stand, Main Road, Katraj, Pune - 411046'}</span>
              </div>
              <div className="flex flex-col items-end text-right space-y-1 shrink-0 font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-[#d4af37]">📞</span>
                  <span>+91 {shopSettings.phone || '98765 43210'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400">💬</span>
                  <span>+91 {shopSettings.whatsapp || shopSettings.phone || '98765 43210'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-slate-50 space-y-5">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase inline-block border-b-2 border-slate-900 pb-0.5">
            CASH / TAX INVOICE
          </h2>
        </div>

        {/* Bill Meta Data */}
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800 border-b border-dashed border-slate-300 pb-3">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-20 text-slate-600 font-bold">Bill No.</span>
              <span className="w-4 text-center">:</span>
              <span className="font-mono font-black text-slate-900">{receipt.billNumber}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-slate-600 font-bold">Date</span>
              <span className="w-4 text-center">:</span>
              <span>{formatInvoiceDate(receipt.date)}</span>
            </div>
          </div>

          <div className="space-y-1 text-right">
            <div className="flex justify-end">
              <span className="w-20 text-slate-600 font-bold text-left">Time</span>
              <span className="w-4 text-center">:</span>
              <span className="w-24 text-right">{receipt.time}</span>
            </div>
            <div className="flex justify-end">
              <span className="w-20 text-slate-600 font-bold text-left">Sales Type</span>
              <span className="w-4 text-center">:</span>
              <span className="w-24 text-right">{receipt.salesType || 'Retail'}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border-b border-dashed border-slate-300 pb-3 text-xs">
          <h3 className="font-extrabold text-slate-900 uppercase tracking-wide mb-2">
            CUSTOMER DETAILS
          </h3>
          <div className="grid grid-cols-12 gap-4 font-semibold text-slate-800">
            <div className="col-span-7 space-y-1">
              <div className="flex items-center">
                <span className="w-20 text-slate-500 font-bold">Name</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="text-slate-900 font-extrabold">{receipt.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-slate-500 font-bold">Mobile No.</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-mono text-slate-900 font-bold">{receipt.customerPhone || '-'}</span>
              </div>
            </div>
            <div className="col-span-5 space-y-1">
              <div className="flex items-start">
                <span className="w-16 text-slate-500 font-bold">Address</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="text-slate-900 font-medium">{receipt.customerAddress || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="text-xs">
          <h3 className="font-extrabold text-slate-900 uppercase tracking-wide mb-2">
            PRODUCT DETAILS
          </h3>
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200 text-slate-800 text-[11px] font-black uppercase">
                <th className="py-2 px-2 border border-slate-300 text-center w-8">#</th>
                <th className="py-2 px-3 border border-slate-300">ITEM DETAILS</th>
                <th className="py-2 px-3 border border-slate-300">IMEI NUMBER</th>
                <th className="py-2 px-2 border border-slate-300 text-center w-12">QTY</th>
                <th className="py-2 px-3 border border-slate-300 text-right">PRICE (₹)</th>
                <th className="py-2 px-3 border border-slate-300 text-right">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="py-3 px-2 border border-slate-300 text-center font-bold text-slate-700 align-middle">
                  1
                </td>
                <td className="py-3 px-3 border border-slate-300 align-middle">
                  <div className="font-bold text-slate-900 text-sm">{receipt.mobileModel}</div>
                  {receipt.ramStorage && (
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {receipt.ramStorage} {receipt.color ? `(${receipt.color})` : ''}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3 border border-slate-300 font-mono text-[11px] text-slate-700 align-middle space-y-0.5">
                  {receipt.imei1 && (
                    <div>
                      <span className="font-semibold text-slate-900">IMEI 1:</span> {receipt.imei1}
                    </div>
                  )}
                  {appSettings.showImei2 && receipt.imei2 && (
                    <div>
                      <span className="font-semibold text-slate-900">IMEI 2:</span> {receipt.imei2}
                    </div>
                  )}
                </td>
                <td className="py-3 px-2 border border-slate-300 text-center font-bold text-slate-800 align-middle">
                  {qty}
                </td>
                <td className="py-3 px-3 border border-slate-300 text-right font-mono font-semibold text-slate-900 align-middle">
                  {formatCurrency(unitPrice)}
                </td>
                <td className="py-3 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900 align-middle">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="text-xs space-y-1.5 border-b border-dashed border-slate-300 pb-3">
          <h3 className="font-extrabold text-slate-900 uppercase tracking-wide mb-2">
            PAYMENT SUMMARY
          </h3>
          <div className="flex justify-between font-semibold text-slate-700 px-1">
            <span>Subtotal</span>
            <span className="font-mono text-slate-900">₹ {formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-700 px-1">
            <span>Discount</span>
            <span className="font-mono text-slate-900">₹ {formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-700 px-1">
            <span>Tax (GST)</span>
            <span className="font-mono text-slate-900">₹ {formatCurrency(tax)}</span>
          </div>

          {/* Highlighted Total Banner */}
          <div className="bg-[#ebdcb9] border border-[#c5b48e] text-slate-900 px-4 py-2.5 rounded flex justify-between items-center mt-2 shadow-sm">
            <span className="font-extrabold text-sm tracking-wider uppercase">TOTAL AMOUNT</span>
            <span className="font-mono text-xl font-black tracking-tight text-slate-900">
              ₹ {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Method Badges */}
        <div className="text-xs flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
          <span className="font-extrabold text-slate-900 uppercase tracking-wide">
            PAYMENT METHOD :
          </span>
          <div className="flex items-center gap-5 font-semibold text-slate-800">
            {renderPaymentCheckbox('Cash', paymentMethod === 'cash')}
            {renderPaymentCheckbox('UPI', paymentMethod === 'upi')}
            {renderPaymentCheckbox('Card', paymentMethod === 'card')}
            {renderPaymentCheckbox('Other', paymentMethod === 'other')}
          </div>
        </div>

        {/* Footer: QR Code, Thank You & Signature */}
        <div className="grid grid-cols-3 gap-4 items-center pt-2">
          {/* QR Code */}
          <div className="flex items-center gap-2.5">
            <div className="w-16 h-16 border border-slate-300 p-1 bg-white flex justify-center items-center rounded-sm shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" fill="#000" />
                <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" fill="#000" />
                <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#000" />
                <rect x="40" y="10" width="10" height="20" fill="#000" />
                <rect x="50" y="30" width="20" height="15" fill="#000" />
                <rect x="10" y="45" width="15" height="10" fill="#000" />
                <rect x="75" y="65" width="20" height="20" fill="#000" />
                <rect x="45" y="65" width="15" height="15" fill="#000" />
                <rect x="35" y="40" width="10" height="10" fill="#000" />
              </svg>
            </div>
            <div className="text-[10px] text-slate-700 font-bold leading-tight flex flex-col justify-center">
              <span>Scan for</span>
              <span>WhatsApp</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600 mt-1" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.347a9.96 9.96 0 004.88 1.284h.005c5.502 0 9.985-4.478 9.988-9.986 0-2.67-1.035-5.18-2.915-7.06a9.92 9.92 0 00-7.096-2.91zm5.72 14.106c-.315.89-1.545 1.636-2.128 1.745-.583.109-1.127.243-3.725-.83-3.21-1.326-5.247-4.57-5.408-4.786-.16-.215-1.282-1.705-1.282-3.253s.803-2.308 1.094-2.607c.29-.3.638-.372.85-.372.213 0 .426.002.612.01.198.01.465-.075.728.56.262.637.896 2.193.974 2.35.077.158.128.342.025.55-.103.208-.155.337-.308.514-.154.177-.323.396-.462.53-.153.15-.313.313-.134.62.179.306.797 1.31 1.708 2.12.177.157.348.243.553.327.205.084.405.076.557-.097.152-.172.658-.767.834-1.03.176-.26.35-.22.59-.13.24.088 1.52.716 1.785.848.265.132.44.198.505.31.065.112.065.652-.25 1.542z"/>
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center space-y-0.5">
            <div className="font-serif italic text-lg font-bold text-slate-800 leading-none">
              Thank You
            </div>
            <div className="font-serif italic text-[11px] text-slate-700">
              for Shopping with Us!
            </div>
            {/* Gold curved brush line SVG */}
            <svg viewBox="0 0 100 8" className="w-28 h-1.5 mx-auto text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5,4 Q50,7 95,2" strokeLinecap="round" />
            </svg>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
              TRUSTED TODAY.
            </div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
              CONNECTED TOMORROW.
            </div>
          </div>

          {/* Signature */}
          <div className="text-center flex flex-col justify-end items-center h-full pt-2">
            <div className="font-serif italic text-2xl font-bold text-slate-800 mb-0.5 px-6 leading-none select-none" style={{ fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive" }}>
              Jan
            </div>
            <div className="w-28 h-[1px] bg-slate-350 my-1"></div>
            <span className="text-[9px] font-bold text-slate-650 uppercase tracking-wider">
              Authorised Signature
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Banner */}
      <div className="bg-[#121417] text-white px-4 py-2.5 flex justify-around items-center text-[10px] font-semibold border-t-2 border-[#d4af37]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#d4af37] text-xs">✔</span>
          <span>100% Genuine Products</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#d4af37] text-xs">💎</span>
          <span>Best Price Guaranteed</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#d4af37] text-xs">👥</span>
          <span>Customer Satisfaction is Our Priority</span>
        </div>
      </div>
    </div>
  );
};
