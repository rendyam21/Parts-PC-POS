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
  X
} from 'lucide-react';
import { getAllTransactions } from '../lib/db';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const data = await getAllTransactions();
    setTransactions(data.reverse()); // Newest first
    setLoading(false);
  }

  const filteredTransactions = transactions.filter(t => 
    t.id?.toString().includes(searchQuery) ||
    t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote;
      case 'transfer': return CreditCard;
      case 'qris': return QrCode;
      default: return CreditCard;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
          <p className="text-slate-500">Pantau semua aktivitas penjualan toko Anda.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-5 h-5 mr-2" />
          Ekspor Laporan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari ID Transaksi atau metode pembayaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          <Calendar className="w-5 h-5 mr-2" />
          Pilih Tanggal
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Transaksi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Metode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const Icon = getPaymentIcon(tx.paymentMethod);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">#{tx.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(tx.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <Icon className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 capitalize">{tx.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">{formatCurrency(tx.total)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
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
              
              <div className="p-6 space-y-6">
                {/* Items List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Produk</h3>
                  <div className="space-y-3">
                    {selectedTransaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Metode Pembayaran</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Waktu</span>
                    <span className="font-bold text-slate-900">
                      {new Date(selectedTransaction.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Akhir</span>
                    <span className="text-2xl font-black text-indigo-600">{formatCurrency(selectedTransaction.total)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors mt-4"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
