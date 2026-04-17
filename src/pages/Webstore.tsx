import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  MessageCircle, 
  ArrowRight,
  Cpu,
  Zap,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { addTransaction } from '../lib/db';

interface WebstoreProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface CartItem extends WebstoreProduct {
  quantity: number;
}

const MOCK_PRODUCTS: WebstoreProduct[] = [
  {
    id: 1,
    name: "ASUS ROG Strix GeForce RTX 4090 OC",
    price: 36500000,
    image: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=1000&auto=format&fit=crop",
    description: "GPU terbaik dengan pendinginan masif dan performa ekstrem untuk gaming 4K dan pekerjaan kreatif profesional.",
    category: "GPU"
  },
  {
    id: 2,
    name: "Intel Core i9-14900K Processor",
    price: 9850000,
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop",
    description: "24 core dan 32 thread, mencapai hingga 6.0 GHz. Prosesor desktop tercepat di dunia untuk para antusias.",
    category: "CPU"
  },
  {
    id: 3,
    name: "MSI MEG Z790 GODLIKE Motherboard",
    price: 18500000,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
    description: "Motherboard flagship E-ATX dengan M-Vision Dashboard dan pengiriman daya ekstrem untuk overclock pemecah rekor.",
    category: "Motherboard"
  },
  {
    id: 4,
    name: "Corsair Dominator Titanium 64GB DDR5",
    price: 7450000,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=1000&auto=format&fit=crop",
    description: "Memori DDR5 premium dengan teknologi pendinginan DHX dan pencahayaan RGB yang dapat disesuaikan untuk performa elit.",
    category: "RAM"
  },
  {
    id: 5,
    name: "Samsung 990 PRO 4TB NVMe SSD",
    price: 5850000,
    image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=1000&auto=format&fit=crop",
    description: "Kecepatan PCIe 4.0 secepat kilat hingga 7.450 MB/s. Sempurna untuk gaming berat dan pengeditan video.",
    category: "Penyimpanan"
  },
  {
    id: 6,
    name: "Seasonic PRIME TX-1600 Titanium",
    price: 8250000,
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop",
    description: "Daya bersertifikat 80 PLUS Titanium 1600W. Puncak teknik dan keandalan PSU.",
    category: "PSU"
  },
  {
    id: 7,
    name: "HYTE Y70 Touch Panoramic Case",
    price: 5450000,
    image: "https://images.unsplash.com/photo-1631553127989-53d34086ce13?q=80&w=1000&auto=format&fit=crop",
    description: "Casing estetika modern yang menampilkan layar multi-sentuh 4K terintegrasi dan desain kaca panoramik.",
    category: "Casing"
  },
  {
    id: 8,
    name: "Corsair iCUE LINK H150i LCD AIO",
    price: 4950000,
    image: "https://images.unsplash.com/photo-1614932259125-276cb9607f87?q=80&w=1000&auto=format&fit=crop",
    description: "Pendingin cairan CPU 360mm dengan layar LCD 2,1\" yang cerah dan sistem kabel iCUE LINK yang revolusioner.",
    category: "Pendingin"
  },
  {
    id: 9,
    name: "ASUS ROG Swift OLED PG42UQ",
    price: 24500000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop",
    description: "Monitor gaming OLED 4K 41,5 inci dengan refresh rate 138Hz overclock dan waktu respons 0,1ms.",
    category: "Monitor"
  }
];

export default function Webstore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  const [lastTransactionItems, setLastTransactionItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'transfer' | 'qris' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product: WebstoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckoutInitiate = () => {
    setIsPaymentModalOpen(true);
  };

  const handleFinalCheckout = async () => {
    if (!selectedPayment) return;
    
    try {
      // Save to Database
      const transactionData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          costPrice: (item as any).costPrice || (MOCK_PRODUCTS.find(p => p.id === item.id) as any)?.costPrice || 0,
          quantity: item.quantity
        })),
        total: total,
        paymentMethod: selectedPayment as any
      };

      const id = await addTransaction(transactionData as any);
      setLastTransactionId(id);
      setLastTransactionItems([...cart]);
      
      setIsPaymentModalOpen(false);
      setIsSuccessModalOpen(true);
      setCart([]);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan saat memproses pesanan.');
    }
  };

  const handleContactWhatsApp = () => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp tujuan
    const message = encodeURIComponent(
      `Halo PC Parts Pro, saya ingin mengonfirmasi pesanan saya (ID: #${lastTransactionId}).\n\n` +
      `*Total: ${formatCurrency(total)}*\n` +
      `*Metode: ${(selectedPayment || '').toUpperCase()}*\n\n` +
      `Terima kasih!`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">webstore <span className="text-blue-600">RendyAM</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Beranda</a>
            <a href="#products" className="hover:text-blue-600 transition-colors">Produk</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Panduan Rakit</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Dukungan</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center"
            >
              Admin
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors group"
            >
              <ShoppingBag className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center space-x-3 px-4 py-2 bg-white border border-blue-100 rounded-2xl shadow-sm shadow-blue-50"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-600">Dipercaya oleh 10rb+ Perakit</span>
            </motion.div>
 
             <div className="space-y-6">
               <motion.h1 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, ease: "easeOut" }}
                 className="text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight"
               >
                 Bangun <br />
                 <span className="relative">
                   <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient">PC Impian</span>
                   <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-100 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                   </svg>
                 </span>
               </motion.h1>
               
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2, duration: 0.6 }}
                 className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium"
               >
                 Tingkatkan pengalaman komputasi Anda dengan komponen kelas dunia. Kami mengkurasi hanya hardware paling bertenaga untuk Anda yang menolak berkompromi.
               </motion.p>
             </div>
 
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.6 }}
               className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
             >
               <a href="#products" className="group relative px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-200 active:scale-95">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="relative flex items-center">
                   Mulai Merakit
                   <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </span>
               </a>
               <button className="px-8 py-5 bg-white border-2 border-slate-100 text-slate-700 rounded-[2rem] font-bold hover:bg-slate-50 hover:border-blue-100 transition-all flex items-center">
                 <Zap className="w-5 h-5 mr-2 text-blue-600" />
                 Penawaran Eksklusif
               </button>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="flex items-center space-x-12 pt-4"
             >
               <div className="flex flex-col">
                 <span className="text-3xl font-black text-slate-900 tracking-tighter">99.9%</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keandalan</span>
               </div>
               <div className="w-px h-10 bg-slate-100" />
               <div className="flex flex-col">
                 <span className="text-3xl font-black text-slate-900 tracking-tighter">24 Jm</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengiriman Cepat</span>
               </div>
             </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:ml-auto"
          >
            {/* Decorative Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -left-12 p-6 bg-white rounded-[2rem] shadow-2xl border border-slate-50 z-20 hidden xl:block"
            >
              <Cpu className="w-10 h-10 text-blue-600" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -right-8 p-6 bg-white rounded-[2rem] shadow-2xl border border-slate-50 z-20 hidden xl:block"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-sm font-bold text-slate-700">Tersedia Sekarang</span>
              </div>
            </motion.div>

            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-blue-600/30 transition-colors" />
              <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a0?q=80&w=1200&auto=format&fit=crop" 
                  alt="Premium PC Build" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Brand Ticker */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-100"
        >
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Mitra Hardware Resmi</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['NVIDIA', 'INTEL', 'ASUS', 'MSI', 'CORSAIR', 'SAMSUNG'].map(brand => (
              <span key={brand} className="text-xl md:text-2xl font-black text-slate-400 hover:text-blue-600 cursor-default transition-colors">{brand}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Garansi Resmi</h3>
              <p className="text-sm text-slate-500">Semua produk disertai garansi asli dari produsen.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Pengiriman Cepat</h3>
              <p className="text-sm text-slate-500">Pengiriman aman dan asuransi ke seluruh pelosok negeri.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Saran Ahli</h3>
              <p className="text-sm text-slate-500">Konsultasikan dengan ahli kami untuk PC impian Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900">Komponen Unggulan</h2>
              <p className="text-slate-500">Hardware kelas atas untuk mahakarya Anda berikutnya.</p>
            </div>
            <div className="flex space-x-2">
              {['Semua', 'GPU', 'CPU', 'RAM'].map(cat => (
                <button key={cat} className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  cat === 'Semua' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PRODUCTS.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group bg-white rounded-[2rem] border border-slate-100 p-4 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500"
              >
                <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 mb-6 relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-blue-600 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="px-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-black text-slate-900">{formatCurrency(product.price)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase">webstore RendyAM</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Tujuan utama Anda untuk hardware PC premium. Kami menyediakan komponen terbaik dengan garansi resmi dan dukungan ahli.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Tautan Cepat</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Buletin</h4>
            <p className="text-sm text-slate-400">Berlangganan untuk mendapatkan penawaran terbaru dan berita hardware.</p>
            <div className="flex space-x-2">
              <input type="email" placeholder="Email" className="bg-slate-800 border-none rounded-xl px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
              <button className="p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center text-sm text-slate-500">
          © 2026 webstore RendyAM. Seluruh hak cipta dilindungi.
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 inset-y-0 z-[70] w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Keranjang Anda</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
 
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {cart.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                       <ShoppingBag className="w-10 h-10 opacity-20" />
                     </div>
                     <p className="font-medium italic">Keranjang Anda kosong</p>
                     <button 
                       onClick={() => setIsCartOpen(false)}
                       className="text-blue-600 font-bold hover:underline"
                     >
                       Mulai Belanja
                     </button>
                   </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex space-x-4 group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-blue-600">{formatCurrency(item.price)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-white rounded-md transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-white rounded-md transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Pengiriman</span>
                      <span className="text-emerald-600 font-bold">Gratis</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
 
                   <button 
                     onClick={handleCheckoutInitiate}
                     className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-3"
                   >
                     <ShoppingBag className="w-6 h-6" />
                     <span>Selesaikan Pesanan</span>
                   </button>
                   <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                     Checkout Aman & Terjamin
                   </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Payment Selection Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Pilih Pembayaran</h2>
                  <p className="text-slate-500 text-sm">Silakan pilih metode pembayaran favorit Anda</p>
                </div>

                <div className="grid gap-4">
                  {[
                    { id: 'cash', name: 'Tunai / Cash', icon: <Zap className="w-6 h-6" />, desc: 'Bayar saat pengambilan' },
                    { id: 'transfer', name: 'Bank Transfer', icon: <Cpu className="w-6 h-6" />, desc: 'BCA, Mandiri, BNI' },
                    { id: 'qris', name: 'QRIS / E-Wallet', icon: <ShieldCheck className="w-6 h-6" />, desc: 'GoPay, OVO, Dana' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id as any)}
                      className={cn(
                        "flex items-center space-x-4 p-5 rounded-[2rem] border-2 transition-all text-left group",
                        selectedPayment === method.id 
                          ? "border-blue-600 bg-blue-50/50" 
                          : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        selectedPayment === method.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                      )}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{method.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{method.desc}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white rotate-45" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    disabled={!selectedPayment}
                    onClick={handleFinalCheckout}
                    className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-3"
                  >
                    <span>Selesaikan Pembayaran</span>
                  </button>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-600/10 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-8 text-center space-y-8"
            >
              <div className="relative mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Pesanan Berhasil!</h2>
                <p className="text-slate-500 font-medium">Transaksi Anda telah tercatat dengan ID <span className="text-blue-600 font-bold">#{lastTransactionId}</span></p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 printable">
                <div className="text-center border-b border-dashed border-slate-200 pb-3 mb-2">
                  <p className="font-black text-xs uppercase tracking-widest">PC PARTS PRO</p>
                  <p className="text-[10px] text-slate-400">Bukti Pembayaran Sah</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">ID Transaksi</span>
                    <span className="font-bold text-slate-900">#{lastTransactionId}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Waktu</span>
                    <span className="font-bold text-slate-900">{new Date().toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="py-3 border-y border-dashed border-slate-200 space-y-2">
                  {lastTransactionItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span className="text-slate-600 truncate max-w-[120px]">{item.name} x{item.quantity}</span>
                      <span className="font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Metode</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedPayment}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-600 font-black uppercase">Berhasil</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900">
                  <div className="flex justify-between font-black text-sm text-slate-900 uppercase">
                    <span>Total Bayar</span>
                    <span>{formatCurrency(lastTransactionItems.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[8px] text-slate-400 font-medium italic">Terima kasih atas kepercayaan Anda!</p>
                </div>
              </div>

              <div className="space-y-3 no-print">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handlePrintReceipt}
                    className="py-4 bg-white border border-slate-200 text-slate-700 rounded-[2rem] font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Struk</span>
                  </button>
                  <button
                    onClick={handleContactWhatsApp}
                    className="py-4 bg-emerald-50 text-emerald-700 rounded-[2rem] font-bold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-lg"
                >
                  Kembali Belanja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
