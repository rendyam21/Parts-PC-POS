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
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Kelola Produk', path: '/admin/products', icon: Package },
  { name: 'Kasir / PoS', path: '/admin/pos', icon: ShoppingCart },
  { name: 'Riwayat Transaksi', path: '/admin/transactions', icon: History },
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          !isSidebarOpen ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 lg:w-64"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-bottom border-slate-100">
            <Cpu className="w-8 h-8 text-blue-600 shrink-0" />
            <span className={cn(
              "ml-3 font-bold text-xl tracking-tight transition-opacity duration-300",
              !isSidebarOpen && "lg:opacity-0 lg:hidden"
            )}>
              PC Parts Pro
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className={cn(
                    "ml-3 font-medium transition-opacity duration-300 whitespace-nowrap",
                    !isSidebarOpen && "lg:opacity-0 lg:hidden"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center px-2 py-3">
              <UserCircle className="w-8 h-8 text-slate-400 shrink-0" />
              <div className={cn(
                "ml-3 transition-opacity duration-300",
                !isSidebarOpen && "lg:opacity-0 lg:hidden"
              )}>
                <p className="text-sm font-semibold">Tech Store</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

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
