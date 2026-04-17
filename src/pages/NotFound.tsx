import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, AlertTriangle, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Icon Container */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-32 h-32 bg-indigo-100 rounded-full mx-auto flex items-center justify-center"
          >
            <AlertTriangle className="w-16 h-16 text-indigo-600" />
          </motion.div>
          
          <motion.div
            animate={{ 
              x: [0, 10, -10, 0],
              y: [0, -10, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-1/4 p-3 bg-white rounded-2xl shadow-lg border border-slate-100"
          >
            <Search className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>

        <div className="space-y-3">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
          <p className="text-slate-500 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan, dihapus, atau Anda salah mengetik alamat URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/" 
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 group"
          >
            <Home className="w-5 h-5 mr-2" />
            Ke Beranda
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
        </div>

        {/* Footer branding */}
        <div className="pt-12 text-slate-400 text-sm font-medium">
          webstore RendyAM &bull; 2026
        </div>
      </div>
    </div>
  );
}
