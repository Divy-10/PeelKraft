import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400 font-inter">Loading...</p>
    </div>
  </div>
);

// Client Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/client/Home'));
const About = lazy(() => import('./pages/client/About'));
const Products = lazy(() => import('./pages/client/Products'));
const ProductDetails = lazy(() => import('./pages/client/ProductDetails'));
const Sustainability = lazy(() => import('./pages/client/Sustainability'));
const Blogs = lazy(() => import('./pages/client/Blogs'));
const BlogDetails = lazy(() => import('./pages/client/BlogDetails'));
const FAQ = lazy(() => import('./pages/client/FAQ'));
const Contact = lazy(() => import('./pages/client/Contact'));
const SearchPage = lazy(() => import('./pages/client/Search'));
const PrivacyPolicy = lazy(() => import('./pages/client/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/client/TermsConditions'));
const CookiePolicy = lazy(() => import('./pages/client/CookiePolicy'));
const NotFound = lazy(() => import('./pages/client/NotFound'));

import { CookieProvider } from './context/CookieContext';
import { PopupProvider } from './context/PopupContext';
import CookieBanner from './components/layout/CookieBanner';
import CookieSettingsModal from './components/layout/CookieSettingsModal';

// E-commerce Client Pages
const Cart = lazy(() => import('./pages/client/Cart'));
const Wishlist = lazy(() => import('./pages/client/Wishlist'));
const Checkout = lazy(() => import('./pages/client/Checkout'));
const OrderSuccess = lazy(() => import('./pages/client/OrderSuccess'));
const MyProfile = lazy(() => import('./pages/client/MyProfile'));
const MyOrders = lazy(() => import('./pages/client/MyOrders'));
const Login = lazy(() => import('./pages/client/Login'));
const Register = lazy(() => import('./pages/client/Register'));
const ForgotPassword = lazy(() => import('./pages/client/ForgotPassword'));
const VerifyEmail = lazy(() => import('./pages/client/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/client/ResetPassword'));

// Admin Pages (Lazy Loaded)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminBlogs = lazy(() => import('./pages/admin/Blogs'));
const AdminBlogForm = lazy(() => import('./pages/admin/BlogForm'));
const AdminFaqs = lazy(() => import('./pages/admin/Faqs'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'));
const AdminSeo = lazy(() => import('./pages/admin/SeoManager'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// E-commerce Admin Pages
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetails = lazy(() => import('./pages/admin/OrderDetails'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminPopups = lazy(() => import('./pages/admin/PopupList'));
const AdminPopupForm = lazy(() => import('./pages/admin/PopupForm'));

const App = () => {
  return (
    <CookieProvider>
      <PopupProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Client Routes */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetails />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            
            {/* E-commerce client-side paths */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/new" element={<AdminBlogForm />} />
            <Route path="blogs/edit/:id" element={<AdminBlogForm />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="seo" element={<AdminSeo />} />
            <Route path="settings" element={<AdminSettings />} />
            
            {/* E-commerce admin-side paths */}
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="popups" element={<AdminPopups />} />
            <Route path="popups/new" element={<AdminPopupForm />} />
            <Route path="popups/edit/:id" element={<AdminPopupForm />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CookieBanner />
      <CookieSettingsModal />
      </PopupProvider>
    </CookieProvider>
  );
};

export default App;
