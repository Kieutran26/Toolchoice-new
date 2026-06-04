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
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Admin from '@/pages/Admin';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthProvider } from '@/lib/AuthContext';

const PublicApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin Route (Private local auth inside Admin component) */}
      <Route path="/admin" element={<Admin />} />

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
