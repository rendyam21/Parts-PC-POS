import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode,
  CheckCircle2,
  Package,
  ArrowRight,
  X,
  Printer
} from 'lucide-react';
import { getAllProducts, addTransaction } from '../lib/db';
import { Product, TransactionItem } from '../types';
import { formatCurrency, cn, formatNumber, parseNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const data = await getAllProducts();
    setProducts(data);
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id!, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as TransactionItem[]);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    if (confirm('Kosongkan keranjang?')) {
      setCart([]);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && cashReceived < total) {
      alert('Uang yang diterima kurang!');
      return;
    }
    
    try {
      const transactionData = {
        items: cart.map(item => ({
          ...item,
          costPrice: products.find(p => p.id === item.productId)?.costPrice || 0
        })),
        total,
        paymentMethod
      };
      const id = await addTransaction(transactionData);
      setLastTransactionId(id);
      setLastTransaction(transactionData);
      
      setIsCheckoutModalOpen(false);
      setIsCheckoutSuccess(true);
      setCart([]);
      setCashReceived(0);
      fetchProducts();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout gagal. Silakan coba lagi.');
    }
  };

  const quickCashOptions = [total, 50000, 100000, 200000, 500000].filter(val => val >= total);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-8 relative">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Kasir / PoS</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 lg:pb-0">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "bg-white p-3 rounded-2xl border border-slate-200 text-left hover:shadow-md transition-all group relative",
                  product.stock <= 0 && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="aspect-square rounded-xl bg-slate-50 mb-3 overflow-hidden border border-slate-100">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 text-sm">{formatCurrency(product.price)}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    product.stock > 10 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    Stok: {product.stock}
                  </span>
                </div>
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Habis</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Floating Checkout Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden w-[calc(100%-3rem)]"
          >
            <button 
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-between px-6"
            >
              <div className="flex items-center">
                <div className="relative mr-3">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-blue-600">
                    {cart.length}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-80">Total Tagihan</p>
                  <p className="font-black">{formatCurrency(total)}</p>
                </div>
              </div>
              <div className="flex items-center font-bold">
                Bayar <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart / Order Summary (Desktop Sidebar) */}
      <div 
        id="cart-sidebar"
        className="hidden lg:flex w-96 flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-xl mr-3">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-lg">Keranjang</h2>
          </div>
          <button 
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 disabled:opacity-30 flex items-center"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Hapus
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p className="text-sm italic">Keranjang kosong</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            Lanjut ke Pembayaran
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Checkout & Payment Modal (Unified for Mobile & Desktop) */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-xl mr-3">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Pembayaran</h2>
                  </div>
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Order Summary in Modal */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ringkasan Pesanan</p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {cart.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.name} x{item.quantity}</span>
                        <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Tagihan</span>
                    <span className="text-xl font-black text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Metode Pembayaran</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cash', icon: Banknote, label: 'Tunai' },
                      { id: 'transfer', icon: CreditCard, label: 'Transfer' },
                      { id: 'qris', icon: QrCode, label: 'QRIS' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setPaymentMethod(method.id as any);
                          if (method.id !== 'cash') setCashReceived(total);
                          else setCashReceived(0);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                          paymentMethod === method.id 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                        )}
                      >
                        <method.icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nominal Bayar</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input 
                          type="text"
                          autoFocus
                          value={formatNumber(cashReceived)}
                          onChange={(e) => setCashReceived(parseNumber(e.target.value))}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quickCashOptions.map((val) => (
                        <button
                          key={val}
                          onClick={() => setCashReceived(val)}
                          className="px-4 py-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                        >
                          {val === total ? 'Uang Pas' : formatNumber(val)}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {cashReceived >= total && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
                        >
                          <span className="text-emerald-700 font-bold">Kembalian</span>
                          <span className="text-xl font-black text-emerald-700">{formatCurrency(cashReceived - total)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                <button 
                  disabled={paymentMethod === 'cash' && cashReceived < total}
                  onClick={handleCheckout}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-200"
                >
                  Konfirmasi & Bayar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal with Receipt Printing */}
      <AnimatePresence>
        {isCheckoutSuccess && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-600/20 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center relative">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Transaksi Berhasil!</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID: #{lastTransactionId}</p>
              </div>

              {/* Printable Receipt Preview */}
              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 text-left printable">
                <div className="text-center border-b border-dashed border-slate-200 pb-3 mb-2">
                  <p className="font-black text-xs uppercase tracking-widest">PC PARTS PRO - POS</p>
                  <p className="text-[10px] text-slate-400">Bukti Transaksi Toko</p>
                </div>

                <div className="space-y-1.5 py-2 border-b border-dashed border-slate-200">
                  {lastTransaction?.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span className="text-slate-600">{item.name} x{item.quantity}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Total</span>
                    <span className="font-black text-slate-900">{formatCurrency(lastTransaction?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Metode</span>
                    <span className="font-bold text-slate-900 capitalize">{lastTransaction?.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[8px] text-slate-400 font-bold italic uppercase tracking-widest">Terima kasih atas kunjungannya!</p>
                </div>
              </div>

              <div className="space-y-3 no-print">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk</span>
                </button>
                <button 
                  onClick={() => setIsCheckoutSuccess(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
