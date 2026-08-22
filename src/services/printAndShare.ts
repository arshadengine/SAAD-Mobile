import html2pdf from 'html2pdf.js';
import type { Receipt } from '../types';

export function handleBrowserPrint() {
  window.print();
}

export async function generateReceiptPDF(receipt: Receipt): Promise<void> {
  const element = document.getElementById('printable-receipt-content');
  if (!element) {
    console.error('Printable receipt element not found');
    return;
  }

  const filename = `SAAD-MOBILE-${receipt.billNumber}.pdf`;

  const opt = {
    margin: [5, 5, 5, 5], // [top, left, bottom, right] in mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback if html2pdf fails
    window.print();
  }
}

export async function shareReceipt(receipt: Receipt): Promise<boolean> {
  const textContent = `
SAAD MOBILE - RECEIPT
Bill No: ${receipt.billNumber}
Date: ${receipt.date} ${receipt.time}
Customer: ${receipt.customerName}
Item: ${receipt.mobileModel}
IMEI: ${receipt.imei1}
Total: ₹${Number(receipt.price).toLocaleString('en-IN')}

Thank you for shopping with SAAD Mobile!
`.trim();

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Receipt ${receipt.billNumber} - SAAD Mobile`,
        text: textContent,
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Share API failed:', err);
      }
    }
  }

  // Fallback: Copy summary to clipboard
  try {
    await navigator.clipboard.writeText(textContent);
    alert('Receipt summary copied to clipboard! You can paste it in WhatsApp or SMS.');
    return true;
  } catch (clipboardErr) {
    console.error('Clipboard copy failed:', clipboardErr);
    return false;
  }
}
