import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  History
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{stat.value}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon className="w-16 h-16 rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-sm flex items-center">
              <History className="w-4 h-4 mr-2 text-indigo-500" />
              Transaksi Terakhir
            </h2>
            <Link to="/admin/transactions" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {transactions.slice(-6).reverse().map((tx) => (
              <div key={tx.id} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-xs">Order #{tx.id}</p>
                    <p className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-slate-900">{formatCurrency(tx.total)}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase">{tx.paymentMethod}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">Belum ada transaksi</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-sm flex items-center">
              <Package className="w-4 h-4 mr-2 text-amber-500" />
              Peringatan Stok
            </h2>
            <Link to="/admin/products" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Kelola</Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {products.filter(p => p.stock < 10).slice(0, 6).map((product) => (
              <div key={product.id} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="max-w-[150px]">
                    <p className="font-bold text-xs truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "inline-flex px-1.5 py-0.5 rounded text-[10px] font-black uppercase",
                    product.stock < 5 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {product.stock} items left
                  </div>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs italic">Semua stok aman</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
