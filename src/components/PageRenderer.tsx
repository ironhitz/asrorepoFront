import React from 'react';
import { SecurityDashboard } from '../pages/SecurityDashboard';
import { CompliancePage } from '../pages/Compliance';
import { AnalyticsPage } from '../pages/Analytics';

interface PageRendererProps {
  activeTab: string;
  // Add other props as needed for existing components
}

/**
 * Navigation/Router Helper
 * Maps activeTab to the appropriate page component
 * Integrates with existing tab-based routing system
 * Security: Only renders whitelisted page components
 */
export function PageRenderer({ activeTab }: PageRendererProps) {
  // Whitelist of allowed pages
  const allowedPages = new Set([
    'security-dashboard',
    'compliance-dashboard',
    'analytics-dashboard',
  ]);

  // Validate activeTab to prevent unauthorized rendering
  if (!allowedPages.has(activeTab)) {
    return null;
  }

  switch (activeTab) {
    case 'security-dashboard':
      return <SecurityDashboard />;
    case 'compliance-dashboard':
      return <CompliancePage />;
    case 'analytics-dashboard':
      return <AnalyticsPage />;
    default:
      return null;
  }
}

/**
 * Get page title for display
 */
export function getPageTitle(activeTab: string): string {
  const titleMap: Record<string, string> = {
    'security-dashboard': 'Security Dashboard',
    'compliance-dashboard': 'Compliance',
    'analytics-dashboard': 'Analytics',
  };
  return titleMap[activeTab] || 'Dashboard';
}

/**
 * Check if the page is one of the new dashboard pages
 */
export function isDashboardPage(tabId: string): boolean {
  return [
    'security-dashboard',
    'compliance-dashboard',
    'analytics-dashboard',
  ].includes(tabId);
}
