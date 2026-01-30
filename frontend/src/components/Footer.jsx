import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  GraduationCap, 
  MessageCircle, 
  BookOpen, 
  ClipboardList, 
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

const Footer = () => {
  const { user } = useUser();
  const location = useLocation();

  // Don't show footer on login, register, onboarding pages
  if (['/login', '/register', '/onboarding'].includes(location.pathname)) {
    return null;
  }

  const quickLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'AI Counsellor', path: '/counsellor', icon: MessageCircle },
    { name: 'Universities', path: '/universities', icon: BookOpen },
    { name: 'Tasks', path: '/tasks', icon: ClipboardList },
  ];

  const supportLinks = [
    { name: 'Help Center', path: '#' },
    { name: 'Contact Support - bhaveysaluja5656@gmail.com', path: 'mailto:bhaveysaluja5656@gmail.com' },
    { name: 'FAQ', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ];

  const studyDestinations = [
    { name: 'Study in USA', path: '#' },
    { name: 'Study in UK', path: '#' },
    { name: 'Study in Canada', path: '#' },
    { name: 'Study in Australia', path: '#' },
    { name: 'Study in Germany', path: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">AI Counsellor</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your AI-powered guide to study abroad success. From confusion to clarity, 
              we help students navigate their international education journey with 
              personalized recommendations and expert guidance. For any issues or support, 
              contact us directly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {user ? (
                quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <Link 
                        to={link.path} 
                        className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors text-sm"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <>
                  <li>
                    <Link to="/register" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                      Get Started
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-gray-300 hover:text-primary-400 transition-colors text-sm">
                      Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Study Destinations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Study Destinations</h3>
            <ul className="space-y-2">
              {studyDestinations.map((destination) => (
                <li key={destination.name}>
                  <a 
                    href={destination.path} 
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {destination.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Mail className="h-4 w-4 text-primary-400" />
                <a href="mailto:bhaveysaluja5656@gmail.com" className="hover:text-primary-400 transition-colors">
                  bhaveysaluja5656@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>123 Education St, Learning City, LC 12345</span>
              </div>
            </div>
            
            {/* Support Links */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-2">Support</h4>
              <ul className="space-y-1">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.path} 
                      className="text-gray-400 hover:text-primary-400 transition-colors text-xs"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Bar */}
      {user && (
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-wrap justify-center items-center space-x-8">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2026 AI Counsellor. All rights reserved. Built with ❤️ for students worldwide.
            </p>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span>Made with React & Node.js</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;