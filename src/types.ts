export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdAt: number;
}

export interface TransactionItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id?: number;
  items: TransactionItem[];
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  timestamp: number;
}
