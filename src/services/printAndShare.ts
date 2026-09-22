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

  // Ensure both page 1 and page 2 are visible during PDF generation
  const page1 = element.querySelector('.receipt-page-1') as HTMLElement | null;
  const page2 = element.querySelector('.receipt-page-2') as HTMLElement | null;
  const prevHidden1 = page1?.classList.contains('hidden');
  const prevHidden2 = page2?.classList.contains('hidden');
  if (page1 && prevHidden1) page1.classList.remove('hidden');
  if (page2 && prevHidden2) page2.classList.remove('hidden');

  const filename = `SAAD-MOBILE-${receipt.billNumber}.pdf`;

  const opt = {
    margin: [4, 4, 4, 4], // [top, left, bottom, right] in mm
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css'], before: '.receipt-page-2' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback if html2pdf fails
    window.print();
  } finally {
    if (page1 && prevHidden1) page1.classList.add('hidden');
    if (page2 && prevHidden2) page2.classList.add('hidden');
  }
}

export async function shareReceipt(receipt: Receipt): Promise<boolean> {
  const itemsList = receipt.items && receipt.items.length > 0
    ? receipt.items.map((it, idx) => {
        if (it.itemType === 'accessory') {
          const warrantyInfo = it.warranty ? ` (Warranty: ${it.warranty})` : '';
          return `${idx + 1}. ${it.mobileModel}${warrantyInfo} - ₹${Number(it.price).toLocaleString('en-IN')}`;
        }
        return `${idx + 1}. ${it.mobileModel} (IMEI: ${it.imei1 || '-'}) - ₹${Number(it.price).toLocaleString('en-IN')}`;
      }).join('\n')
    : `Item: ${receipt.mobileModel}\nIMEI: ${receipt.imei1 || '-'}`;

  const textContent = `
SAAD MOBILE - RECEIPT
Bill No: ${receipt.billNumber}
Date: ${receipt.date} ${receipt.time}
Customer: ${receipt.customerName}

Items:
${itemsList}

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
