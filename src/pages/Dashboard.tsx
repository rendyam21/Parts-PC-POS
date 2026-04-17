import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Bell,
  X,
  ArrowLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
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
  const averageTransaction = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Generate chart data (mocking 7 days)
  const days = ['Sab', 'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
  const chartData = days.map((day, i) => ({
    name: day,
    revenue: transactions
      .filter(t => new Date(t.timestamp).getDay() === (i + 5) % 7) // Simple mock mapping
      .reduce((acc, t) => acc + t.total, 0) || Math.floor(Math.random() * 5000000),
    sales: transactions
      .filter(t => new Date(t.timestamp).getDay() === (i + 5) % 7)
      .length || Math.floor(Math.random() * 10)
  }));

  const stats = [
    { 
      label: 'Total Pendapatan', 
      value: formatCurrency(totalRevenue), 
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Penjualan', 
      value: totalSales.toString(), 
      icon: ShoppingCart, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Total Produk', 
      value: totalProducts.toString(), 
      icon: Package, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500',
      trend: '0%',
      trendUp: true
    },
    { 
      label: 'Rata-rata Transaksi', 
      value: formatCurrency(averageTransaction), 
      icon: TrendingUp, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500',
      trend: '-2.1%',
      trendUp: false
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-400">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50" />
          </button>
          <div className="text-right border-l pl-6 border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toko Buka</p>
            <p className="text-sm font-black text-slate-900">Sesi Aktif</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.bg)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center text-[11px] font-black tracking-tight",
                stat.trendUp ? "text-emerald-500" : "text-rose-500"
              )}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
        >
          <div className="flex flex-col mb-8">
            <h2 className="text-lg font-black text-slate-800">Grafik Pendapatan (7 Hari Terakhir)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales Volume Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
        >
          <div className="flex flex-col mb-8">
            <h2 className="text-lg font-black text-slate-800">Volume Penjualan</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-black text-slate-800 flex items-center">
              <History className="w-5 h-5 mr-3 text-indigo-500" />
              Transaksi Terakhir
            </h2>
            <Link to="/admin/transactions" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {transactions.slice(-5).reverse().map((tx) => (
              <div key={tx.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Order #{tx.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(tx.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{formatCurrency(tx.total)}</p>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{tx.paymentMethod}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic">Belum ada transaksi</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-black text-slate-800 flex items-center">
              <Package className="w-5 h-5 mr-3 text-orange-500" />
              Peringatan Stok
            </h2>
            <Link to="/admin/products" className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1 rounded-full">Kelola</Link>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
              <div key={product.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="max-w-[200px]">
                    <p className="font-bold text-slate-800 text-sm truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    product.stock < 5 ? "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100" : "bg-orange-50 text-orange-600 shadow-sm shadow-orange-100"
                  )}>
                    Stok: {product.stock}
                  </div>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic">Semua stok aman</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
