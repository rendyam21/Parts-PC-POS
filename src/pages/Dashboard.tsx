import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getAllProducts, getAllTransactions } from '../lib/db';
import { Product, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [p, t] = await Promise.all([getAllProducts(), getAllTransactions()]);
      setProducts(p);
      setTransactions(t);
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.total, 0);
  const totalSales = transactions.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  const stats = [
    { 
      label: 'Total Pendapatan', 
      value: formatCurrency(totalRevenue), 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Transaksi', 
      value: totalSales.toString(), 
      icon: ShoppingCart, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Total Produk', 
      value: totalProducts.toString(), 
      icon: Package, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: '0%',
      trendUp: true
    },
    { 
      label: 'Stok Menipis', 
      value: lowStockProducts.toString(), 
      icon: Users, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      trend: '-2.1%',
      trendUp: false
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Selamat datang kembali, Tech Store!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Transaksi Terakhir</h2>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(-5).reverse().map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Order #{tx.id}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(tx.total)}</p>
                  <p className="text-xs text-slate-400 capitalize">{tx.paymentMethod}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 italic">Belum ada transaksi</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Peringatan Stok</h2>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Kelola Stok</button>
          </div>
          <div className="divide-y divide-slate-100">
            {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-bold text-sm",
                    product.stock < 5 ? "text-rose-600" : "text-amber-600"
                  )}>
                    Sisa {product.stock}
                  </p>
                  <p className="text-xs text-slate-400">Stok Menipis</p>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="p-8 text-center text-slate-500 italic">Semua stok aman</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
