// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from "./pages/BookingPage";
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { TermsPage, CancellationPage, PricingPage } from './pages/StaticPages';
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cancellation" element={<CancellationPage />} />
              <Route path="/privacy" element={<TermsPage />} />
              <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center pt-24 text-center">
                  <div className="text-6xl mb-4">🏟️</div>
                  <h2 className="font-display text-4xl tracking-wider text-gray-900 mb-2">PAGE NOT FOUND</h2>
                  <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;