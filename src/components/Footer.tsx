import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg text-white tracking-wider">HyperGreen 360</span>
        </div>
        <p className="text-sm leading-relaxed mb-4">Premium sports turf facility in the heart of Sivakasi. Football & Cricket with floodlights, open 24/7.</p>
        <div className="flex gap-3">
          <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="text-white font-bold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          {[['/', 'Home'], ['/booking', 'Book Now'], ['/gallery', 'Gallery'], ['/my-bookings', 'My Bookings'], ['/contact', 'Contact']].map(([to, label]) => (
            <li key={to}><Link to={to} className="hover:text-green-400 transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="text-white font-bold mb-4">Legal</h4>
        <ul className="space-y-2 text-sm">
          {[['/terms', 'Terms & Conditions'], ['/cancellation', 'Cancellation Policy'], ['/privacy', 'Privacy Policy']].map(([to, label]) => (
            <li key={to}><Link to={to} className="hover:text-green-400 transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-white font-bold mb-4">Contact Us</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-2"><MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /><span>Housing Board, Sivakasi – 626 123, Tamil Nadu</span></li>
          <li className="flex gap-2"><Phone className="w-4 h-4 text-green-400 shrink-0" /><a href="tel:8056564775" className="hover:text-green-400">8056564775</a></li>
          <li className="flex gap-2"><Mail className="w-4 h-4 text-green-400 shrink-0" /><a href="mailto:info@hypergreen360.com" className="hover:text-green-400">info@hypergreen360.com</a></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
      © 2025 HyperGreen 360 Turf. All rights reserved.
    </div>
  </footer>
);

export default Footer;