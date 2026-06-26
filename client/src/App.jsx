import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './i18n';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingChat from './components/feature/FloatingChat';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GiftCards from './pages/GiftCards';
import CardDetail from './pages/CardDetail';
import USDTPayment from './pages/USDTPayment';
import MyPage from './pages/MyPage';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import StaticPage from './pages/StaticPage';
import Events from './pages/Events';
import CardRecovery from './pages/CardRecovery';
import Notifications from './pages/Notifications';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const HIDDEN_LAYOUT_PATHS = ['/login', '/signup'];

function AppContent() {
  const { pathname } = useLocation();
  const hideLayout = HIDDEN_LAYOUT_PATHS.some(p => pathname.startsWith(p));

  return (
    <>
      <ScrollToTop />
      {!hideLayout && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/giftcards" element={<GiftCards />} />
        <Route path="/giftcards/:slug" element={<CardDetail />} />
        <Route path="/payment/:orderId" element={<USDTPayment />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/card-recovery" element={<CardRecovery />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<StaticPage page="faq" />} />
        <Route path="/guide" element={<StaticPage page="guide" />} />
        <Route path="/refund-policy" element={<StaticPage page="refund" />} />
        <Route path="/safe-trading" element={<StaticPage page="safe" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideLayout && <Footer />}
      {!hideLayout && <FloatingChat />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
