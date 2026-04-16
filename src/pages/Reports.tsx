import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  ShoppingBag, 
  Wallet, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { getAllTransactions, getAllProducts } from '../lib/db';
import { Transaction, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    async function fetchData() {
      const [t, p] = await Promise.all([getAllTransactions(), getAllProducts()]);
      setTransactions(t);
      setProducts(p);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Loading Reports...</div>;

  // 1. Data Processing: Revenue per Day
  const getRevenueData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date).getTime();
      const end = endOfDay(date).getTime();
      
      const dayRevenue = transactions
        .filter(t => t.timestamp >= start && t.timestamp <= end)
        .reduce((sum, t) => sum + t.total, 0);
      
      data.push({
        name: format(date, 'dd MMM', { locale: id }),
        value: dayRevenue
      });
    }
    return data;
  };

  // 2. Data Processing: Top Products
  const getTopProductsData = () => {
    const productSales: Record<string, { name: string, sales: number, revenue: number }> = {};
    
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, sales: 0, revenue: 0 };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // 3. Data Processing: Payment Methods
  const getPaymentMethodData = () => {
    const methods: Record<string, number> = { cash: 0, transfer: 0, qris: 0 };
    transactions.forEach(t => {
      methods[t.paymentMethod] = (methods[t.paymentMethod] || 0) + t.total;
    });
    return Object.entries(methods).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  };

  const revenueData = getRevenueData();
  const topProductsData = getTopProductsData();
  const paymentMethodData = getPaymentMethodData();

  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalCost = transactions.reduce((acc, t) => 
    acc + t.items.reduce((iAcc, item) => iAcc + (item.costPrice * item.quantity), 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const averageOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;
  const totalItemsSold = transactions.reduce((acc, t) => acc + t.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Laporan Analitik</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wawasan Bisnis & Kinerja Penjualan</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
          </select>
          <button className="flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Modal', value: formatCurrency(totalCost), icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Laba (Profit)', value: formatCurrency(totalProfit), icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Item Terjual', value: totalItemsSold, icon: PieChartIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className={cn("inline-flex p-2 rounded-lg mb-3", kpi.bg)}>
              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-lg font-black text-slate-900 leading-tight">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-sm uppercase tracking-tight flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              Tren Pendapatan
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(value) => `IDR ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-black text-sm uppercase tracking-tight mb-6 flex items-center">
            <Wallet className="w-4 h-4 mr-2 text-emerald-500" />
            Metode Pembayaran
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-black text-sm uppercase tracking-tight mb-6 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2 text-amber-500" />
            Produk Terlaris (Berdasarkan Pendapatan)
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topProductsData}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 700, width: 90 }}
                  width={90}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                >
                  {topProductsData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
