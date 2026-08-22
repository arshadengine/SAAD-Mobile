import { db } from './db';
import type { Receipt, AppSettings } from '../types';

export async function getNextBillNumber(): Promise<{ billNumber: string; sequence: number }> {
  const settings = await db.appSettings.toCollection().first();
  const prefix = settings?.billPrefix || 'SM-';
  const sequence = settings?.nextBillSequence || 1;
  const formattedSeq = String(sequence).padStart(6, '0');
  return {
    billNumber: `${prefix}${formattedSeq}`,
    sequence
  };
}

export async function createReceipt(receiptData: Omit<Receipt, 'id' | 'billNumber' | 'timestamp'>): Promise<Receipt> {
  const settings = await db.appSettings.toCollection().first();
  const prefix = settings?.billPrefix || 'SM-';
  const sequence = settings?.nextBillSequence || 1;
  const formattedSeq = String(sequence).padStart(6, '0');
  const billNumber = `${prefix}${formattedSeq}`;
  const timestamp = Date.now();

  const newReceipt: Receipt = {
    ...receiptData,
    billNumber,
    timestamp
  };

  const id = await db.receipts.add(newReceipt);

  // Increment sequence for next bill
  if (settings && settings.id) {
    await db.appSettings.update(settings.id, {
      nextBillSequence: sequence + 1
    });
  }

  return { ...newReceipt, id };
}

export async function getAllReceipts(): Promise<Receipt[]> {
  return await db.receipts.orderBy('timestamp').reverse().toArray();
}

export async function getReceiptById(id: number): Promise<Receipt | undefined> {
  return await db.receipts.get(id);
}

export async function deleteReceipt(id: number): Promise<void> {
  await db.receipts.delete(id);
}

export async function searchReceipts(query: string): Promise<Receipt[]> {
  const q = query.toLowerCase().trim();
  if (!q) return await getAllReceipts();

  return await db.receipts.filter(r => 
    r.billNumber.toLowerCase().includes(q) ||
    r.customerName.toLowerCase().includes(q) ||
    (r.customerPhone && r.customerPhone.includes(q)) ||
    r.mobileModel.toLowerCase().includes(q) ||
    r.imei1.includes(q) ||
    (r.imei2 && r.imei2.includes(q))
  ).reverse().toArray();
}

export async function getDashboardStats() {
  const receipts = await getAllReceipts();
  
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const todayReceipts = receipts.filter(r => r.date.includes(todayStr) || isToday(r.timestamp));
  const todayCount = todayReceipts.length;
  const todaySales = todayReceipts.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  const totalCount = receipts.length;
  const totalSales = receipts.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  return {
    todayCount,
    todaySales,
    totalCount,
    totalSales,
    recentReceipts: receipts.slice(0, 5)
  };
}

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}
