import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import CategoryPage from '@/pages/CategoryPage';
import Deals from '@/pages/Deals';
import ToolDetailPage from '@/pages/ToolDetailPage';
import BlogListPage from '@/pages/BlogListPage';
import BlogPostPage from '@/pages/BlogPostPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Admin from '@/pages/Admin';
import SEOHead from '@/components/SEOHead';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthProvider } from '@/lib/AuthContext';

const AdminRouteWrapper = () => (
  <>
    <SEOHead
      title="Quản trị hệ thống | Toolchoice"
      description="Trang quản trị nội bộ Toolchoice."
      canonicalPath="/admin"
      robots="noindex, nofollow"
    />
    <Admin />
  </>
);

const PublicApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing/:pricing" element={<Home />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/category/:category/:pricing" element={<CategoryPage />} />
      <Route path="/tool/:slug" element={<ToolDetailPage />} />
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin Route (Private local auth inside Admin component, noindex) */}
      <Route path="/admin" element={<AdminRouteWrapper />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <PublicApp />
            <CookieConsentBanner />
          </Router>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
