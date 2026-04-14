import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAllProducts, addProduct } from './lib/db';

async function seedData() {
  const products = await getAllProducts();
  if (products.length === 0) {
    const initialProducts = [
      { name: 'Intel Core i9-14900K', price: 9500000, stock: 15, category: 'Processor', image: 'https://picsum.photos/seed/cpu/200' },
      { name: 'NVIDIA RTX 4090 24GB', price: 32000000, stock: 5, category: 'GPU', image: 'https://picsum.photos/seed/gpu/200' },
      { name: 'ASUS ROG Maximus Z790', price: 12500000, stock: 10, category: 'Motherboard', image: 'https://picsum.photos/seed/mobo/200' },
      { name: 'Corsair Vengeance 32GB DDR5', price: 2800000, stock: 25, category: 'RAM', image: 'https://picsum.photos/seed/ram/200' },
      { name: 'Samsung 990 Pro 2TB NVMe', price: 3500000, stock: 30, category: 'Storage', image: 'https://picsum.photos/seed/ssd/200' },
      { name: 'Corsair RM1000x 1000W', price: 3200000, stock: 12, category: 'PSU', image: 'https://picsum.photos/seed/psu/200' },
    ];
    for (const p of initialProducts) {
      await addProduct(p);
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
