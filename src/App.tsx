import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '@pages/admin/dashboard';
import AdminLayout from './layouts/admin';
import Customer from '@pages/admin/customer';
import Login from '@pages/admin/auth/login';
import NotFound from '@pages/notFound';
import PrivateRoutes from './routes/private.route';
import Brand from '@pages/admin/brand';
import Categories from './pages/admin/categories';
import ProductCreatePage from './pages/admin/product/product.create';


const App: React.FC = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin"
          element={
            <PrivateRoutes>
              <AdminLayout />
            </PrivateRoutes>
          } >
          <Route index element={<Dashboard />} />
          <Route path="customer" element={<Customer />} />
          <Route path="brand" element={<Brand />} />
          <Route path="categories" element={<Categories />} />
          <Route path="product/create" element={<ProductCreatePage />} />

        </Route>
        <Route path="admin/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter >
  );
};

export default App;