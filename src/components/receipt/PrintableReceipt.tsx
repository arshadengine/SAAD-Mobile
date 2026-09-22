import React from 'react';
import type { ShopSettings, Receipt, AppSettings } from '../../types';
import { getReceiptItems } from '../../database/receipts';

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

  const items = getReceiptItems(receipt);
  const calculatedSubtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1), 0);
  const subtotal = receipt.subtotal ?? (calculatedSubtotal > 0 ? calculatedSubtotal : Number(receipt.price) || 0);
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
      className={`mx-auto font-sans leading-tight select-none ${
        isPreview ? 'max-w-2xl space-y-6' : 'w-full max-w-2xl space-y-0'
      } ${isThermal ? 'w-[80mm] text-xs' : ''}`}
      style={{ colorScheme: 'light' }}
    >
      {/* ======================================================== */}
      {/* PAGE 1: CASH / TAX INVOICE                               */}
      {/* ======================================================== */}
      <div className={`receipt-page receipt-page-1 bg-white text-slate-900 border border-slate-350 shadow-md ${
        isPreview ? 'rounded-sm' : 'border-none shadow-none'
      }`}>
        {/* Top Black Header Banner */}
        <div className="bg-[#121417] text-white py-2.5 px-5 relative border-b-4 border-[#d4af37]">
          <div className="flex flex-row items-center gap-5">
            {/* Logo Section */}
            <div className="shrink-0">
              {shopSettings.logoUrl ? (
                <img
                  src={shopSettings.logoUrl}
                  alt={shopSettings.shopName}
                  className="h-20 w-20 object-contain rounded-full border-2 border-[#d4af37]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] bg-black flex flex-col justify-center items-center p-2 text-center">
                  <span className="text-[#d4af37] font-extrabold text-lg leading-none">SAAD</span>
                  <span className="text-white text-[10px] font-bold tracking-widest mt-1">MOBILE</span>
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
                  🛒 <span>SECOND HAND MOBILES</span>
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
        <div className="p-4 bg-slate-50 space-y-3.5">
          {/* Title */}
          <div className="text-center flex items-center justify-center gap-4 my-1">
            <span className="h-[1.5px] bg-[#d4af37] w-12 inline-block"></span>
            <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase">
              CASH / TAX INVOICE
            </h2>
            <span className="h-[1.5px] bg-[#d4af37] w-12 inline-block"></span>
          </div>

          {/* Bill Meta Data */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs font-semibold text-slate-800 border-b border-dashed border-slate-350 pb-3">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-16 text-slate-600 font-bold">Bill No.</span>
                <span className="w-4 text-center">:</span>
                <span className="font-mono font-black text-slate-900">{receipt.billNumber}</span>
              </div>
              <div className="flex">
                <span className="w-16 text-slate-600 font-bold">Date</span>
                <span className="w-4 text-center">:</span>
                <span>{formatInvoiceDate(receipt.date)}</span>
              </div>
              <div className="flex">
                <span className="w-16 text-slate-600 font-bold">Time</span>
                <span className="w-4 text-center">:</span>
                <span>{receipt.time}</span>
              </div>
            </div>

            <div className="space-y-1 pl-8">
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold">Sales Type</span>
                <span className="w-4 text-center">:</span>
                <span>{receipt.salesType || 'Retail'}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold">Payment Method</span>
                <span className="w-4 text-center">:</span>
                <span>{receipt.paymentMethod || 'Cash'}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="border-t border-b border-dashed border-slate-350 py-2.5 text-xs">
            <div className="bg-[#121417] text-[#d4af37] px-3 py-1 font-black uppercase tracking-wider text-[10px] rounded-sm inline-block mb-2 select-none">
              <span>👥</span>
              <span className="ml-1.5">CUSTOMER DETAILS</span>
            </div>
            <div className="grid grid-cols-12 items-center font-semibold text-slate-800">
              {/* Left side: Name and Mobile */}
              <div className="col-span-6 space-y-1.5 pl-1">
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

              {/* Middle vertical line divider */}
              <div className="col-span-1 flex justify-center h-8">
                <div className="w-[1px] bg-slate-300 h-full"></div>
              </div>

              {/* Right side: Address */}
              <div className="col-span-5 flex items-start gap-1 pl-4">
                <span className="text-amber-500">📍</span>
                <span className="text-slate-500 font-bold">Address</span>
                <span className="text-slate-400 font-bold mx-1">:</span>
                <span className="text-slate-900 font-medium break-all">{receipt.customerAddress || '-'}</span>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-3">
            <div className="bg-[#121417] text-[#d4af37] px-3 py-1 font-black uppercase tracking-wider text-[10px] rounded-sm inline-block select-none">
              <span>📱</span>
              <span className="ml-1.5">PRODUCT DETAILS</span>
            </div>

            {/* Product Details Table */}
            <div className="text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121417] text-[#d4af37] text-[11px] font-black uppercase border border-[#121417] select-none">
                    <th className="py-2.5 px-2 border-r border-[#333] text-center w-8">#</th>
                    <th className="py-2.5 px-3 border-r border-[#333]">ITEM DETAILS</th>
                    <th className="py-2.5 px-3 border-r border-[#333]">IMEI / WARRANTY</th>
                    <th className="py-2.5 px-2 border-r border-[#333] text-center w-12">QTY</th>
                    <th className="py-2.5 px-3 border-r border-[#333] text-right w-28">PRICE (₹)</th>
                    <th className="py-2.5 px-3 text-right w-28">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const itemQty = item.quantity || 1;
                    const itemPrice = Number(item.price) || 0;
                    const itemTotal = itemPrice * itemQty;
                    const isAccessory = item.itemType === 'accessory' || (!item.imei1 && item.warranty !== undefined);

                    return (
                      <tr key={item.id || index} className="bg-white border border-slate-300 border-t-0">
                        <td className="py-2.5 px-2 border-r border-slate-300 text-center font-bold text-slate-700 align-middle">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 align-middle">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{item.mobileModel}</span>
                            {isAccessory && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded select-none">
                                ACCESSORY
                              </span>
                            )}
                          </div>
                          {item.ramStorage && (
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.ramStorage} {item.color ? `(${item.color})` : ''}
                            </div>
                          )}
                          {!item.ramStorage && item.color && (
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Color: {item.color}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-mono text-[11px] text-slate-700 align-middle space-y-0.5">
                          {isAccessory ? (
                            <div className="font-sans">
                              {item.warranty && item.warranty !== 'No Warranty' ? (
                                <div className="flex items-center gap-1 text-slate-900 font-bold">
                                  <span className="text-amber-600">🛡️</span>
                                  <span>Warranty: {item.warranty}</span>
                                </div>
                              ) : (
                                <span className="text-slate-450 font-medium">No Warranty</span>
                              )}
                            </div>
                          ) : (
                            <>
                              {item.imei1 ? (
                                <div>
                                  <span className="font-semibold text-slate-900">IMEI 1:</span> {item.imei1}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-sans">-</span>
                              )}
                              {appSettings.showImei2 && item.imei2 && (
                                <div>
                                  <span className="font-semibold text-slate-900">IMEI 2:</span> {item.imei2}
                                </div>
                              )}
                              {item.warranty && (
                                <div className="text-[10px] font-sans text-amber-700 font-semibold mt-0.5">
                                  🛡️ {item.warranty}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-center font-bold text-slate-800 align-middle">
                          {itemQty}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-right font-mono font-semibold text-slate-900 align-middle">
                          {formatCurrency(itemPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 align-middle">
                          {formatCurrency(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Split Section: Payment Summary & Thank You Column */}
          <div className="grid grid-cols-2 gap-6 items-start pt-1">
            {/* Left Column: Payment Summary Box */}
            <div>
              <div className="bg-[#121417] text-[#d4af37] px-3 py-1.5 font-black uppercase tracking-wider text-[10px] rounded-t flex items-center gap-1.5 border border-[#121417] select-none">
                <span>💳</span>
                <span>PAYMENT SUMMARY</span>
              </div>
              <div className="border border-slate-300 border-t-0 p-4 bg-white rounded-b space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-700 px-1 text-[11px]">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">₹ {formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700 px-1 text-[11px]">
                  <span>Discount</span>
                  <span className="font-mono text-slate-900">₹ {formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700 px-1 text-[11px]">
                  <span>Tax (GST)</span>
                  <span className="font-mono text-slate-900">₹ {formatCurrency(tax)}</span>
                </div>

                {/* Highlighted Total Banner */}
                <div className="bg-[#ebdcb9] border border-[#c5b48e] text-slate-900 px-3 py-2 rounded flex justify-between items-center mt-3 shadow-sm select-none">
                  <span className="font-extrabold text-[11px] tracking-wider uppercase">TOTAL AMOUNT</span>
                  <span className="font-mono text-base font-black tracking-tight text-slate-900">
                    ₹ {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Thank You, QR Code, Signature */}
            <div className="flex flex-col justify-between h-full space-y-3">
              {/* Thank You Message */}
              <div className="text-center space-y-0.5 select-none">
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

              {/* QR Code and Signature Side-by-Side */}
              <div className="flex justify-between items-end pt-1">
                {/* WhatsApp QR */}
                <div className="flex items-center gap-2">
                  <div className="w-20 h-20 border border-slate-300 p-0.5 bg-white flex justify-center items-center rounded-sm shrink-0">
                    <img
                      src="/whatsapp-qr.jpeg"
                      alt="Scan for WhatsApp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold leading-tight flex flex-col justify-center">
                    <span>Scan for</span>
                    <span>WhatsApp</span>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600 mt-1" fill="currentColor">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.347a9.96 9.96 0 004.88 1.284h.005c5.502 0 9.985-4.478 9.988-9.986 0-2.67-1.035-5.18-2.915-7.06a9.92 9.92 0 00-7.096-2.91zm5.72 14.106c-.315.89-1.545 1.636-2.128 1.745-.583.109-1.127.243-3.725-.83-3.21-1.326-5.247-4.57-5.408-4.786-.16-.215-1.282-1.705-1.282-3.253s.803-2.308 1.094-2.607c.29-.3.638-.372.85-.372.213 0 .426.002.612.01.198.01.465-.075.728.56.262.637.896 2.193.974 2.35.077.158.128.342.025.55-.103.208-.155.337-.308.514-.154.177-.323.396-.462.53-.153.15-.313.313-.134.62.179.306.797 1.31 1.708 2.12.177.157.348.243.553.327.205.084.405.076.557-.097.152-.172.658-.767.834-1.03.176-.26.35-.22.59-.13.24.088 1.52.716 1.785.848.265.132.44.198.505.31.065.112.065.652-.25 1.542z"/>
                    </svg>
                  </div>
                </div>

                {/* Owner Signature */}
                <div className="flex flex-col items-center justify-end">
                  <img
                    src="/signature.png"
                    alt="Authorised Signature"
                    className="w-28 h-12 object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="w-28 h-[1px] bg-slate-350 my-1"></div>
                  <span className="text-[9px] font-bold text-slate-650 uppercase tracking-wider text-center block">
                    Authorised Signature
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Badges */}
          <div className="text-xs flex items-center justify-between border-t border-dashed border-slate-300 pt-2 pb-1">
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

          {/* Notice referencing Page 2 Terms & Conditions */}
          <div className="bg-amber-50/90 border border-amber-250 rounded p-2 flex items-center justify-between text-[10px] text-amber-950 font-semibold select-none">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-sm">📋</span>
              <span>नियम व शर्तें (Terms & Conditions, No-Return Policy & Customer Declaration) पृष्ठ 2 पर देखें।</span>
            </div>
            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 rounded border border-amber-300 tracking-wider shrink-0">
              PAGE 2 →
            </span>
          </div>
        </div>

        {/* Bottom Footer Banner */}
        <div className="bg-[#121417] text-white px-3 py-1.5 flex justify-around items-center text-[9px] font-semibold border-t-2 border-[#d4af37] select-none">
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
            <span className="text-[#d4af37] text-xs">🔄</span>
            <span>Easy Exchange</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#d4af37] text-xs">👥</span>
            <span>Customer Satisfaction is Our Priority</span>
          </div>
        </div>

        {/* Gold line + VISIT AGAIN text + Page 1 of 2 */}
        <div className="bg-white border-t border-slate-200 py-1 px-4 font-bold text-[10px] text-slate-800 tracking-widest select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37]">★★★</span>
            <span>VISIT AGAIN | THANK YOU!</span>
            <span className="text-[#d4af37]">★★★</span>
          </div>
          <span className="text-slate-500 font-mono text-[9px] tracking-normal">Page 1 of 2</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DEDICATED PAGE BREAK (For PDF & Print + Preview Divider) */}
      {/* ======================================================== */}
      <div className="html2pdf__page-break my-6 print:my-0 flex items-center justify-center gap-3 print:hidden select-none">
        <div className="h-[1px] bg-slate-300 flex-1"></div>
        <div className="bg-slate-800 text-[#d4af37] text-xs font-bold px-4 py-1.5 rounded-full shadow flex items-center gap-2 border border-slate-700">
          <span>📜</span>
          <span>PAGE 2: TERMS & CONDITIONS / नियम व शर्तें</span>
        </div>
        <div className="h-[1px] bg-slate-300 flex-1"></div>
      </div>

      {/* ======================================================== */}
      {/* PAGE 2: TERMS & CONDITIONS & CUSTOMER DECLARATION        */}
      {/* ======================================================== */}
      <div className={`receipt-page receipt-page-2 bg-white text-slate-900 border border-slate-350 shadow-md ${
        isPreview ? 'rounded-sm' : 'border-none shadow-none'
      }`}>
        {/* Page 2 Top Branded Header */}
        <div className="bg-[#121417] text-white py-2.5 px-5 border-b-4 border-[#d4af37] select-none">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {shopSettings.logoUrl ? (
                <img
                  src={shopSettings.logoUrl}
                  alt={shopSettings.shopName}
                  className="h-12 w-12 object-contain rounded-full border border-[#d4af37]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full border border-[#d4af37] bg-black flex flex-col justify-center items-center text-center">
                  <span className="text-[#d4af37] font-black text-xs leading-none">SAAD</span>
                  <span className="text-white text-[8px] font-bold tracking-widest mt-0.5">MOBILE</span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-black tracking-wider text-white uppercase leading-none">
                  SAAD <span className="text-[#d4af37]">MOBILE</span>
                </h2>
                <div className="text-[9px] text-slate-300 tracking-wider uppercase mt-1">
                  TERMS & CONDITIONS • POLICY ANNEXURE
                </div>
              </div>
            </div>

            {/* Reference to Bill & Customer */}
            <div className="text-right text-[10px] text-slate-300 space-y-0.5 font-mono">
              <div>
                <span className="text-slate-400">Invoice:</span> <span className="font-bold text-[#d4af37]">{receipt.billNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Date:</span> <span className="text-white">{formatInvoiceDate(receipt.date)}</span>
              </div>
              <div className="font-sans text-[10px]">
                <span className="text-slate-400">Customer:</span> <span className="text-white font-bold">{receipt.customerName || 'Walk-in Customer'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Body Content */}
        <div className="p-4 bg-slate-50 space-y-3.5">
          {/* Section Title */}
          <div className="text-center flex items-center justify-center gap-4 my-0.5">
            <span className="h-[1.5px] bg-[#d4af37] w-12 inline-block"></span>
            <h2 className="text-base font-black text-slate-900 tracking-wider uppercase">
              TERMS & CONDITIONS / नियम व शर्तें
            </h2>
            <span className="h-[1.5px] bg-[#d4af37] w-12 inline-block"></span>
          </div>

          {/* Policy Box 1: Second-Hand Mobile Policy */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-[#121417] text-[#d4af37] px-3.5 py-1.5 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-[#121417] select-none">
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>सेकंड हैंड मोबाइल – नो रिटर्न, नो गारंटी पॉलिसी</span>
              </div>
              <span className="text-[9px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                अनिवार्य नियम
              </span>
            </div>
            
            <div className="p-3 text-[11px] leading-relaxed text-slate-800 space-y-2 font-medium">
              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-[#d4af37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span className="pt-0.5 font-semibold text-slate-900">यह मोबाइल सेकंड हैंड (Used Mobile) है।</span>
              </div>

              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-[#d4af37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="pt-0.5">ग्राहक द्वारा मोबाइल की पूरी जांच (Checking) और टेस्टिंग (Testing) खरीदने से पहले स्वयं की जाती है।</span>
              </div>

              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-[#d4af37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span className="pt-0.5">भविष्य में मोबाइल में आने वाली किसी भी तकनीकी (Technical) या हार्डवेयर (Hardware) समस्या के लिए दुकान ज़िम्मेदार नहीं होगी।</span>
              </div>

              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-[#d4af37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                <span className="pt-0.5">मोबाइल में भविष्य में आने वाली किसी भी प्रकार की समस्या (Problem) की पूरी ज़िम्मेदारी ग्राहक की होगी।</span>
              </div>

              <div className="flex gap-2 items-start">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-[#d4af37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div className="pt-0.5">
                  <span className="font-semibold text-slate-900">खरीदने से पहले फोन को अच्छी तरह से जांच लें:</span> खात्री करें कि सभी कार्यशील हो रहा है, जैसे स्क्रीन, कैमरा, स्पीकर, माइक्रोफोन, और वाई-फाई। बैटरी बैकअप एवं बैटरी की स्थिति देखें कि बैटरी की खपत असामान्य तो नहीं है। कुछ समय तक फोन का उपयोग करके बैटरी का प्रदर्शन जांचें।
                </div>
              </div>

              <div className="flex gap-2 items-start bg-amber-50/70 p-2.5 rounded-md border border-amber-250">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">6</span>
                <div className="pt-0.5">
                  <span className="font-extrabold text-slate-900">एक बार मोबाइल खरीदने के बाद –</span>
                  <div className="mt-1 space-y-0.5 font-bold text-rose-700">
                    <div className="flex items-center gap-1.5">
                      <span>•</span>
                      <span>कोई रिटर्न (Return) स्वीकार नहीं किया जाएगा।</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>•</span>
                      <span>कोई वारंटी या गारंटी (Warranty / Guarantee) नहीं दी जाएगी।</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Box 2: Accessories Warranty Policy */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-[#121417] text-[#d4af37] px-3.5 py-1.5 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 border-b border-[#121417] select-none">
              <span>🛡️</span>
              <span>एक्सेसरीज़ वारंटी नीति (ACCESSORIES WARRANTY POLICY)</span>
            </div>
            <div className="p-3 text-[11px] text-slate-800 space-y-1.5 leading-relaxed font-medium">
              <p>
                <span className="font-bold text-slate-900">1. वारंटी अवधि:</span> एक्सेसरीज़ (चार्जर, ईयरफोन, केबल, पावर बैंक इत्यादि) पर वारंटी केवल इनवॉइस पर उल्लेखित समयावधि (Warranty Period) के अनुसार ही मान्य होगी।
              </p>
              <p>
                <span className="font-bold text-slate-900">2. नियम एवं शर्तें:</span> वारंटी केवल निर्माण दोष (Manufacturing Defects) पर मान्य है। फिज़िकल डैमेज, पानी/लिक्विड डैमेज, वायर कटने, या शॉर्ट सर्किट की स्थिति में वारंटी स्वतः समाप्त मानी जाएगी।
              </p>
              <p>
                <span className="font-bold text-slate-900">3. इनवॉइस अनिवार्य:</span> किसी भी प्रकार के वारंटी क्लेम के लिए यह मूल इनवॉइस (Bill) प्रस्तुत करना अनिवार्य है।
              </p>
            </div>
          </div>

          {/* Box 3: Customer Declaration & Acknowledgment */}
          <div className="border-2 border-slate-300 rounded-lg p-3 bg-white space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-[11px] uppercase tracking-wide">
              <span>✍️</span>
              <span>ग्राहक सहमति एवं घोषणा (CUSTOMER DECLARATION & ACKNOWLEDGEMENT)</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium italic">
              "मैंने SAAD MOBILE से खरीदे गए उपरोक्त मोबाइल फोन / एक्सेसरीज़ की स्वयं पूरी तरह से जांच (Checking & Testing) कर ली है तथा सभी फीचर्स सुचारू रूप से कार्य कर रहे हैं। मैंने ऊपर दिए गए सभी 6 नियम, शर्तें, नो-रिटर्न पॉलिसी एवं एक्सेसरीज़ वारंटी शर्तों को ध्यानपूर्वक पढ़ व समझ लिया है और मैं इनसे पूर्णतः सहमत हूँ।"
            </p>
          </div>

          {/* Dual Signatures Box */}
          <div className="border border-slate-300 rounded-lg p-3.5 bg-white grid grid-cols-2 gap-8 items-end select-none">
            {/* Customer Signature Box */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-end justify-center pb-1">
                <div className="w-44 border-b-2 border-dashed border-slate-400"></div>
              </div>
              <div className="font-bold text-[11px] text-slate-900 uppercase">
                Customer Signature / ग्राहक के हस्ताक्षर
              </div>
              <div className="text-[9px] text-slate-500 font-medium">
                (Accepted & Confirmed)
              </div>
            </div>

            {/* Shop Signature Box */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-center justify-center">
                <img
                  src="/signature.png"
                  alt="Authorised Signature"
                  className="w-28 h-10 object-contain mix-blend-multiply"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="w-44 border-b border-slate-400 mx-auto"></div>
              <div className="font-bold text-[11px] text-slate-900 uppercase mt-0.5">
                For SAAD MOBILE
              </div>
              <div className="text-[9px] text-slate-650 font-bold uppercase tracking-wider">
                Authorised Signature
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Bottom Footer Banner */}
        <div className="bg-[#121417] text-white px-3 py-1.5 flex justify-around items-center text-[9px] font-semibold border-t-2 border-[#d4af37] select-none">
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
            <span className="text-[#d4af37] text-xs">🔄</span>
            <span>Easy Exchange</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#d4af37] text-xs">👥</span>
            <span>Customer Satisfaction is Our Priority</span>
          </div>
        </div>

        {/* Gold line + VISIT AGAIN text + Page 2 of 2 */}
        <div className="bg-white border-t border-slate-200 py-1 px-4 font-bold text-[10px] text-slate-800 tracking-widest select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37]">★★★</span>
            <span>VISIT AGAIN | THANK YOU!</span>
            <span className="text-[#d4af37]">★★★</span>
          </div>
          <span className="text-slate-500 font-mono text-[9px] tracking-normal">Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
};
