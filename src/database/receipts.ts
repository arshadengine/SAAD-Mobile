import { db } from './db';
import type { Receipt, AppSettings, ReceiptItem } from '../types';

export function getReceiptItems(receipt: Receipt): ReceiptItem[] {
  if (receipt.items && receipt.items.length > 0) {
    return receipt.items.map(item => ({
      ...item,
      itemType: item.itemType || (item.imei1 ? 'mobile' : (item.warranty !== undefined ? 'accessory' : 'mobile'))
    }));
  }
  return [
    {
      id: 'item-1',
      itemType: 'mobile',
      mobileModel: receipt.mobileModel || '',
      ramStorage: receipt.ramStorage,
      color: receipt.color,
      imei1: receipt.imei1 || '',
      imei2: receipt.imei2,
      quantity: receipt.quantity || 1,
      price: receipt.price || 0
    }
  ];
}

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

  // If multiple items/accessories are provided, populate primary fields for backward compatibility/indexing
  const items = receiptData.items && receiptData.items.length > 0 ? receiptData.items : undefined;
  const firstMobile = items?.find(it => it.itemType === 'mobile' || it.imei1);
  const firstItem = firstMobile || items?.[0];

  const primaryMobileModel = receiptData.mobileModel || firstItem?.mobileModel || '';
  const primaryImei1 = receiptData.imei1 || firstItem?.imei1 || '';
  const primaryImei2 = receiptData.imei2 || firstItem?.imei2;
  const primaryRamStorage = receiptData.ramStorage || firstItem?.ramStorage;
  const primaryColor = receiptData.color || firstItem?.color;

  const newReceipt: Receipt = {
    ...receiptData,
    mobileModel: primaryMobileModel,
    imei1: primaryImei1,
    imei2: primaryImei2,
    ramStorage: primaryRamStorage,
    color: primaryColor,
    items,
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

  return await db.receipts.filter(r => {
    const directMatch =
      r.billNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      (r.customerPhone && r.customerPhone.includes(q)) ||
      (r.mobileModel && r.mobileModel.toLowerCase().includes(q)) ||
      (r.imei1 && r.imei1.includes(q)) ||
      (r.imei2 && r.imei2.includes(q));

    if (directMatch) return true;

    if (r.items && r.items.length > 0) {
      return r.items.some(it =>
        it.mobileModel.toLowerCase().includes(q) ||
        (it.imei1 && it.imei1.includes(q)) ||
        (it.imei2 && it.imei2.includes(q)) ||
        (it.ramStorage && it.ramStorage.toLowerCase().includes(q)) ||
        (it.color && it.color.toLowerCase().includes(q)) ||
        (it.warranty && it.warranty.toLowerCase().includes(q)) ||
        (it.itemType && it.itemType.toLowerCase().includes(q))
      );
    }

    return false;
  }).reverse().toArray();
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
