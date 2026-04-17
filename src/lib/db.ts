import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, Transaction, Supplier, AppSettings } from '../types';

interface PCPartsDB extends DBSchema {
  products: {
    key: number;
    value: Product;
    indexes: { 'by-name': string };
  };
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': number };
  };
  suppliers: {
    key: number;
    value: Supplier;
    indexes: { 'by-name': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DATABASE_NAME = 'pc-parts-pos-db';
const DATABASE_VERSION = 3;

export async function initDB(): Promise<IDBPDatabase<PCPartsDB>> {
  return openDB<PCPartsDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', {
          keyPath: 'id',
          autoIncrement: true,
        });
        productStore.createIndex('by-name', 'name');
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        transactionStore.createIndex('by-date', 'timestamp');
      }
      if (!db.objectStoreNames.contains('suppliers')) {
        const supplierStore = db.createObjectStore('suppliers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        supplierStore.createIndex('by-name', 'name');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

export const dbPromise = initDB();

export async function getAllProducts() {
  const db = await dbPromise;
  return db.getAll('products');
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
  const db = await dbPromise;
  return db.add('products', { ...product, createdAt: Date.now() } as Product);
}

export async function updateProduct(product: Product) {
  const db = await dbPromise;
  return db.put('products', product);
}

export async function deleteProduct(id: number) {
  const db = await dbPromise;
  return db.delete('products', id);
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
  const db = await dbPromise;
  const tx = db.transaction(['products', 'transactions'], 'readwrite');
  
  // Update stock for each item
  for (const item of transaction.items) {
    const product = await tx.objectStore('products').get(item.productId);
    if (product) {
      product.stock -= item.quantity;
      await tx.objectStore('products').put(product);
    }
  }
  
  const id = await tx.objectStore('transactions').add({ ...transaction, timestamp: Date.now() } as Transaction);
  await tx.done;
  return id;
}

export async function getAllTransactions() {
  const db = await dbPromise;
  return db.getAll('transactions');
}

// Supplier operations
export async function getAllSuppliers() {
  const db = await dbPromise;
  return db.getAll('suppliers');
}

export async function addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>) {
  const db = await dbPromise;
  return db.add('suppliers', { ...supplier, createdAt: Date.now() } as Supplier);
}

export async function updateSupplier(supplier: Supplier) {
  const db = await dbPromise;
  return db.put('suppliers', supplier);
}

export async function deleteSupplier(id: number) {
  const db = await dbPromise;
  return db.delete('suppliers', id);
}

// Settings operations
const SETTINGS_KEY = 'app_settings';
export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'PC PARTS',
  appDescription: 'Premium PC components marketplace and PoS system for enthusiasts and builders.',
  profitMarginType: 'percentage',
  profitMarginValue: 10
};

export async function getSettings(): Promise<AppSettings> {
  const db = await dbPromise;
  const settings = await db.get('settings', SETTINGS_KEY);
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings) {
  const db = await dbPromise;
  return db.put('settings', settings, SETTINGS_KEY);
}
