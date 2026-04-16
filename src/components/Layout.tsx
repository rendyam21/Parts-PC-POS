import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Menu, 
  X, 
  Cpu,
  Bell,
  UserCircle,
  Globe,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Kelola Produk', path: '/admin/products', icon: Package },
  { name: 'Kasir / PoS', path: '/admin/pos', icon: ShoppingCart },
  { name: 'Riwayat Transaksi', path: '/admin/transactions', icon: History },
  { name: 'Laporan', path: '/admin/reports', icon: BarChart3 },
  { name: 'Lihat Webstore', path: '/', icon: Globe },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:relative",
          !isSidebarOpen ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 lg:w-64"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-slate-100 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className={cn(
              "ml-3 flex flex-col transition-all duration-300 origin-left truncate",
              !isSidebarOpen && "lg:scale-0 lg:opacity-0 lg:w-0"
            )}>
              <span className="font-black text-sm uppercase tracking-tighter leading-tight">PC PARTS PRO</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!isSidebarOpen ? item.name : undefined}
                  className={cn(
                    "flex items-center px-2 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  )} />
                  <span className={cn(
                    "ml-3 text-xs font-bold transition-all duration-300 whitespace-nowrap overflow-hidden origin-left",
                    !isSidebarOpen && "lg:scale-0 lg:opacity-0 lg:w-0"
                  )}>
                    {item.name}
                  </span>
                  {isActive && isSidebarOpen && (
                    <motion.div 
                      layoutId="activeNav"
                      className="ml-auto w-1 h-4 rounded-full bg-white/40"
                    />
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full lg:hidden" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile (Bottom) */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center p-1 rounded-xl hover:bg-white transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                <UserCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className={cn(
                "ml-3 transition-all duration-300 origin-left truncate",
                !isSidebarOpen && "lg:scale-0 lg:opacity-0 lg:w-0"
              )}>
                <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">Tech Store</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        {/* Header */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center space-x-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</span>
              <span className="text-[10px] font-black text-slate-200">/</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {location.pathname.split('/').pop() === 'reports' ? 'Laporan' : (location.pathname.split('/').pop() || 'Dashboard')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                TS
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
