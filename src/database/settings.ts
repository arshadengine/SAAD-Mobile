import { db, DEFAULT_SHOP_SETTINGS, DEFAULT_APP_SETTINGS } from './db';
import type { ShopSettings, AppSettings, BackupData } from '../types';

export async function getShopSettings(): Promise<ShopSettings> {
  const settings = await db.shopSettings.toCollection().first();
  return settings || DEFAULT_SHOP_SETTINGS;
}

export async function updateShopSettings(newSettings: Partial<ShopSettings>): Promise<void> {
  const current = await getShopSettings();
  if (current.id) {
    await db.shopSettings.update(current.id, newSettings);
  } else {
    await db.shopSettings.add({ ...DEFAULT_SHOP_SETTINGS, ...newSettings });
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  const settings = await db.appSettings.toCollection().first();
  return settings || DEFAULT_APP_SETTINGS;
}

export async function updateAppSettings(newSettings: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings();
  if (current.id) {
    await db.appSettings.update(current.id, newSettings);
  } else {
    await db.appSettings.add({ ...DEFAULT_APP_SETTINGS, ...newSettings });
  }
}

export async function exportBackupData(): Promise<string> {
  const shopSettings = await getShopSettings();
  const appSettings = await getAppSettings();
  const receipts = await db.receipts.toArray();

  const backup: BackupData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    shopSettings,
    appSettings,
    receipts
  };

  return JSON.stringify(backup, null, 2);
}

export async function importBackupData(jsonString: string): Promise<boolean> {
  try {
    const backup: BackupData = JSON.parse(jsonString);
    if (!backup.shopSettings || !backup.appSettings || !Array.isArray(backup.receipts)) {
      throw new Error('Invalid backup file structure');
    }

    await db.transaction('rw', [db.shopSettings, db.appSettings, db.receipts], async () => {
      await db.shopSettings.clear();
      await db.appSettings.clear();
      await db.receipts.clear();

      delete backup.shopSettings.id;
      delete backup.appSettings.id;

      await db.shopSettings.add(backup.shopSettings);
      await db.appSettings.add(backup.appSettings);
      
      const cleanReceipts = backup.receipts.map(r => {
        const { id, ...rest } = r;
        return rest;
      });
      await db.receipts.bulkAdd(cleanReceipts);
    });

    return true;
  } catch (err) {
    console.error('Backup import error:', err);
    return false;
  }
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.shopSettings, db.appSettings, db.receipts], async () => {
    await db.shopSettings.clear();
    await db.appSettings.clear();
    await db.receipts.clear();
    await db.shopSettings.add(DEFAULT_SHOP_SETTINGS);
    await db.appSettings.add(DEFAULT_APP_SETTINGS);
  });
}
