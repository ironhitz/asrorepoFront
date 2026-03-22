import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * Main layout component that provides sidebar + main content structure
 * Supports responsive mobile-friendly navigation
 */
export function Layout({ children, sidebar }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 bg-black border-r border-white/10 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
            ASRO
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">{sidebar}</nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-white/10 z-50 transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
            ASRO
          </h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 overflow-y-auto">{sidebar}</nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-black border-b border-white/10 flex items-center px-6 md:px-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
