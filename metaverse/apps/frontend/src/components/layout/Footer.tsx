// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-base text-gray-600 hover:text-purple-600">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-600 hover:text-purple-600">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/documentation" className="text-base text-gray-600 hover:text-purple-600">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-base text-gray-600 hover:text-purple-600">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-600 hover:text-purple-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-gray-600 hover:text-purple-600">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-600 hover:text-purple-600">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-600 hover:text-purple-600">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-500 text-center">
            © {new Date().getFullYear()} Meety. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};