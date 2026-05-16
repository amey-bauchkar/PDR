import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { RfqCartProvider } from './components/RfqCartProvider';
import RfqCartWidget from './components/RfqCartWidget';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductRoute from './pages/ProductRoute';
import Solutions from './pages/Solutions';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import FiberSelector from './pages/FiberSelector';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminNew from './pages/AdminNew';
import NotFound from './pages/NotFound';
import ScrollToHash from './components/ScrollToHash';

// Three.js is heavy — load the configurator on demand
const CableConfigurator = lazy(() => import('./pages/CableConfigurator'));

export default function App() {
  return (
    <RfqCartProvider>
      <ScrollToHash />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductRoute />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="resources" element={<Resources />} />
          <Route path="contact" element={<Contact />} />
          <Route
            path="cable-configurator"
            element={
              <Suspense fallback={<div style={{ padding: 120, textAlign: 'center', color: '#888' }}>Loading 3D configurator…</div>}>
                <CableConfigurator />
              </Suspense>
            }
          />
          <Route path="fiber-selector" element={<FiberSelector />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="admin-new" element={<AdminNew />} />
          <Route path="admin" element={<AdminNew />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <RfqCartWidget />
    </RfqCartProvider>
  );
}
