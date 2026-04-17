export interface Product {
  id?: number;
  name: string;
  price: number;
  costPrice: number; // Added: Harga Modal
  stock: number;
  category: string;
  image?: string;
  supplierId?: number; // Added: ID Supplier
  createdAt: number;
}

export interface Supplier {
  id?: number;
  name: string;
  contact: string;
  address: string;
  email?: string;
  category?: string;
  createdAt: number;
}

export interface TransactionItem {
  productId: number;
  name: string;
  price: number;
  costPrice: number; // Added: Harga Modal saat transaksi
  quantity: number;
}

export interface Transaction {
  id?: number;
  items: TransactionItem[];
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  timestamp: number;
}
