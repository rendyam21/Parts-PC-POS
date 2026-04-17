import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAllProducts, addProduct, getAllSuppliers, addSupplier } from './lib/db';

async function seedData() {
  const [products, suppliers] = await Promise.all([
    getAllProducts(),
    getAllSuppliers()
  ]);

  if (suppliers.length === 0) {
    const initialSuppliers = [
      { name: 'Global Tech Distribution', contact: '0812-3444-5555', address: 'Glodok Jaya Lt. 4, Jakarta', email: 'sales@globaltech.com', category: 'Umum' },
      { name: 'Micro Star Asia', contact: '0811-9988-7766', address: 'Mangga Dua Mall Lt. 5, Jakarta', email: 'support@ms-asia.com', category: 'Motherboard' },
    ];
    for (const s of initialSuppliers) {
      await addSupplier(s);
    }
  }

  if (products.length === 0) {
    const initialProducts = [
      { name: 'Intel Core i9-14900K', price: 9500000, costPrice: 8500000, stock: 15, category: 'Processor', image: 'https://picsum.photos/seed/cpu/200' },
      { name: 'NVIDIA RTX 4090 24GB', price: 32000000, costPrice: 28000000, stock: 5, category: 'GPU', image: 'https://picsum.photos/seed/gpu/200' },
      { name: 'ASUS ROG Maximus Z790', price: 12500000, costPrice: 10500000, stock: 10, category: 'Motherboard', image: 'https://picsum.photos/seed/mobo/200' },
      { name: 'Corsair Vengeance 32GB DDR5', price: 2800000, costPrice: 2200000, stock: 25, category: 'RAM', image: 'https://picsum.photos/seed/ram/200' },
      { name: 'Samsung 990 Pro 2TB NVMe', price: 3500000, costPrice: 2900000, stock: 30, category: 'Storage', image: 'https://picsum.photos/seed/ssd/200' },
      { name: 'Corsair RM1000x 1000W', price: 3200000, costPrice: 2600000, stock: 12, category: 'PSU', image: 'https://picsum.photos/seed/psu/200' },
    ];
    for (const p of initialProducts) {
      await addProduct(p as any);
    }
  }
}

seedData().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
