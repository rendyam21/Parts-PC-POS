/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Webstore from './pages/Webstore';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Webstore />} />
        <Route path="/admin/*" element={
          <Layout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="pos" element={<POS />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
