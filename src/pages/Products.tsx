import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../lib/db';
import { Product } from '../types';
import { formatCurrency, cn, formatNumber, parseNumber } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: 'Umum',
    image: ''
  });

  const seedData = async () => {
    const samples = [
      { name: "ASUS ROG Strix GeForce RTX 4090 OC", price: 36500000, stock: 5, category: "GPU", image: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=1000&auto=format&fit=crop" },
      { name: "Intel Core i9-14900K Processor", price: 9850000, stock: 12, category: "Processor", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop" },
      { name: "MSI MEG Z790 GODLIKE Motherboard", price: 18500000, stock: 3, category: "Motherboard", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop" },
      { name: "Corsair Dominator Titanium 64GB DDR5", price: 7450000, stock: 8, category: "RAM", image: "https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=1000&auto=format&fit=crop" },
      { name: "Samsung 990 PRO 4TB NVMe SSD", price: 5850000, stock: 15, category: "Storage", image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=1000&auto=format&fit=crop" },
      { name: "Seasonic PRIME TX-1600 Titanium", price: 8250000, stock: 6, category: "PSU", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1000&auto=format&fit=crop" },
      { name: "HYTE Y70 Touch Panoramic Case", price: 5450000, stock: 4, category: "Case", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop" },
      { name: "Corsair iCUE LINK H150i LCD AIO", price: 4950000, stock: 10, category: "Cooling", image: "https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=1000&auto=format&fit=crop" },
      { name: "ASUS ROG Swift OLED PG42UQ", price: 24500000, stock: 2, category: "Monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop" }
    ];

    if (confirm('Ini akan menambahkan 9 produk sampel ke inventaris. Lanjutkan?')) {
      for (const sample of samples) {
        await addProduct(sample);
      }
      fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const data = await getAllProducts();
    setProducts(data);
    setLoading(false);
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct({ ...formData, id: editingProduct.id, createdAt: editingProduct.createdAt });
    } else {
      await addProduct(formData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', price: 0, stock: 0, category: 'Umum', image: '' });
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Produk</h1>
          <p className="text-slate-500">Tambah, edit, atau hapus inventaris produk Anda.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={seedData}
            className="flex items-center justify-center px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-sm"
          >
            Seed Sample
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', price: 0, stock: 0, category: 'Umum', image: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama produk atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <span className="font-semibold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                      )}></div>
                      <span className="text-sm text-slate-600">{product.stock} unit</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id!)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Produk</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Contoh: NVIDIA RTX 4080 Super"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Harga (IDR)</label>
                    <input 
                      required
                      type="text"
                      value={formatNumber(formData.price)}
                      onChange={(e) => setFormData({...formData, price: parseNumber(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Stok</label>
                    <input 
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Processor">Processor</option>
                    <option value="GPU">GPU</option>
                    <option value="RAM">RAM</option>
                    <option value="Motherboard">Motherboard</option>
                    <option value="Storage">Storage</option>
                    <option value="PSU">PSU</option>
                    <option value="Case">Case</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Monitor">Monitor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gambar Produk</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-all">
                        <Upload className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Upload Gambar</span>
                      </div>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
