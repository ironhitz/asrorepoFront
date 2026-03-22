import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

/**
 * Footer component with donation link and project info
 * Appears at the bottom of all pages with support and donation options
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Copyright */}
        <div className="text-sm text-white/60">
          <p>© {currentYear} ASRO • Enterprise Security Orchestration</p>
        </div>

        {/* Center: Quick Links */}
        <div className="flex items-center gap-4 text-sm">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            GitHub
            <ExternalLink size={14} />
          </a>
          <span className="text-white/20">•</span>
          <a
            href="/about"
            className="text-white/60 hover:text-white transition-colors"
          >
            About
          </a>
          <span className="text-white/20">•</span>
          <a
            href="/privacy"
            className="text-white/60 hover:text-white transition-colors"
          >
            Privacy
          </a>
        </div>

        {/* Right: Donation Button */}
        <div>
          <a
            href="https://paypal.me/Ironhitz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 rounded-lg font-medium text-sm transition-all hover:shadow-lg transform hover:scale-105"
            title="Support development via PayPal"
          >
            <Heart size={16} className="fill-current" />
            Donate
          </a>
        </div>
      </div>
    </footer>
  );
}
