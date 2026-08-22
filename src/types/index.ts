export interface ShopSettings {
  id?: number;
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  gstin?: string;
  logoUrl?: string; // base64 or public path
  receiptFooterMsg: string;
  termsAndConditions: string[];
}

export interface Receipt {
  id?: number;
  billNumber: string; // e.g. SM-000001
  date: string;       // e.g. 22 August 2026
  time: string;       // e.g. 01:53 PM
  timestamp: number;  // epoch ms for sorting

  // Customer Info
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;

  // Mobile / Product Info
  mobileModel: string;
  ramStorage?: string;
  color?: string;
  imei1: string;
  imei2?: string;
  quantity?: number;
  price: number;
  subtotal?: number;
  discount?: number;
  tax?: number;

  // Additional V1 meta
  salesType?: string; // Retail, Wholesale, etc.
  paymentMethod?: string; // Cash, UPI, Card, Other
  notes?: string;
}

export interface AppSettings {
  id?: number;
  billPrefix: string;      // default: 'SM-'
  nextBillSequence: number;// default: 1
  currencySymbol: string;  // default: '₹'
  receiptSize: 'A4' | 'A5' | '80mm' | '58mm';
  showCustomerPhone: boolean;
  showGstin: boolean;
  showImei2: boolean;
}

export interface BackupData {
  version: string;
  exportDate: string;
  shopSettings: ShopSettings;
  appSettings: AppSettings;
  receipts: Receipt[];
}
