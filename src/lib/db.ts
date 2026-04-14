import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, Transaction } from '../types';

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
}

const DATABASE_NAME = 'pc-parts-pos-db';
const DATABASE_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<PCPartsDB>> {
  return openDB<PCPartsDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
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
