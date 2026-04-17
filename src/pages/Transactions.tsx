import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  Eye, 
  CreditCard, 
  Banknote, 
  QrCode,
  ArrowRight,
  X,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart
} from 'lucide-react';
import { getAllTransactions } from '../lib/db';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const data = await getAllTransactions();
    setTransactions(data.reverse()); // Newest first
    setLoading(false);
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id?.toString().includes(searchQuery) ||
                         t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter.start && dateFilter.end) {
      const txDate = new Date(t.timestamp);
      const startDate = new Date(dateFilter.start);
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = txDate >= startDate && txDate <= endDate;
    }

    return matchesSearch && matchesDate;
  });

  const summary = filteredTransactions.reduce((acc, curr) => {
    const cost = curr.items.reduce((iAcc, item) => iAcc + (item.costPrice * item.quantity), 0);
    acc.income += curr.total;
    acc.outcome += cost;
    acc.profit += (curr.total - cost);
    return acc;
  }, { income: 0, outcome: 0, profit: 0 });

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'transfer': return CreditCard;
      case 'qris': return QrCode;
      default: return CreditCard;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500">Pantau semua aktivitas penjualan toko Anda.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-sm">
          <Download className="w-4 h-4 mr-2" />
          Ekspor Laporan
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pemasukan (Penjualan)', value: summary.income, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Pengeluaran (Modal)', value: summary.outcome, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Keuntungan (Laba)', value: summary.profit, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4"
          >
            <div className={cn("p-3 rounded-lg", item.bg)}>
              <item.icon className={cn("w-5 h-5", item.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
              <p className="text-sm font-black text-slate-900 leading-none">{formatCurrency(item.value)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari ID Transaksi atau metode pembayaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input 
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
          {(dateFilter.start || dateFilter.end) && (
            <button 
              onClick={() => setDateFilter({ start: '', end: '' })}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Reset Filter Tanggal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Metode</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Pemasukan</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Keuntungan</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const Icon = getPaymentIcon(tx.paymentMethod);
                const cost = tx.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
                const profit = tx.total - cost;
                
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-slate-900 text-sm">#{tx.id}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-slate-600">
                      {new Date(tx.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-700 capitalize">{tx.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-slate-900 text-xs">
                      {formatCurrency(tx.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-emerald-600 text-xs">
                      {formatCurrency(profit)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button 
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-xs italic">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div>
                  <h2 className="text-xl font-bold">Detail Transaksi</h2>
                  <p className="text-indigo-100 text-xs mt-1">Order ID: #{selectedTransaction.id}</p>
                </div>
                <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 printable">
                {/* Items List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Produk Terjual</h3>
                  <div className="space-y-3">
                    {selectedTransaction.items.map((item, idx) => {
                      const itemProfit = (item.price - item.costPrice) * item.quantity;
                      return (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-black text-slate-900 break-words">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">
                              {item.quantity} x {formatCurrency(item.price)} 
                              <span className="mx-2 text-slate-300">|</span> 
                              Modal: {formatCurrency(item.costPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                            <p className="text-[10px] font-bold text-emerald-600">Margin: {formatCurrency(itemProfit)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Summary Table */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Total Pemasukan (Penjualan)</span>
                    <span className="text-slate-900">{formatCurrency(selectedTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Total Pengeluaran (Modal)</span>
                    <span className="text-rose-600">
                      -{formatCurrency(selectedTransaction.items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900 uppercase">Laba Kotor</span>
                    <span className="text-lg font-black text-emerald-600">
                      {formatCurrency(selectedTransaction.total - selectedTransaction.items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0))}
                    </span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Metode Bayar</p>
                    <p className="text-xs font-bold text-slate-900 capitalize">{selectedTransaction.paymentMethod}</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Transaksi</p>
                    <p className="text-xs font-bold text-slate-900">
                      {new Date(selectedTransaction.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 no-print">
                  <button 
                    onClick={handlePrint}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak Struk
                  </button>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
