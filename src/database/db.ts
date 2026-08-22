import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { ShopSettings, Receipt, AppSettings } from '../types';

export class SaadMobileDatabase extends Dexie {
  shopSettings!: Table<ShopSettings, number>;
  receipts!: Table<Receipt, number>;
  appSettings!: Table<AppSettings, number>;

  constructor() {
    super('SaadMobileDB');
    this.version(1).stores({
      shopSettings: '++id',
      receipts: '++id, billNumber, customerName, customerPhone, imei1, imei2, mobileModel, timestamp',
      appSettings: '++id'
    });
  }
}

export const db = new SaadMobileDatabase();

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'SAAD Mobile',
  tagline: 'Mobile Sales & Services',
  address: 'Shop No. 4, Main Market, Mobile Hub',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  gstin: '',
  logoUrl: '/logo.png',
  receiptFooterMsg: 'Thank you for shopping with SAAD Mobile!',
  termsAndConditions: [
    'Goods once sold will not be taken back without original bill & valid reason.',
    'Warranty is subject to brand terms & conditions.',
    'Physical/Liquid damage is not covered under warranty.',
    'Please verify IMEI & physical condition before leaving counter.'
  ]
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  billPrefix: 'SM-',
  nextBillSequence: 1,
  currencySymbol: '₹',
  receiptSize: 'A4',
  showCustomerPhone: true,
  showGstin: true,
  showImei2: true
};

export async function initDatabase() {
  const shopCount = await db.shopSettings.count();
  if (shopCount === 0) {
    await db.shopSettings.add(DEFAULT_SHOP_SETTINGS);
  }

  const appSettingsCount = await db.appSettings.count();
  if (appSettingsCount === 0) {
    await db.appSettings.add(DEFAULT_APP_SETTINGS);
  }
}
