import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for capturing React errors
 * Prevents entire app from crashing due to component errors
 * Security: Doesn't expose sensitive error details in production
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details (in production, send to monitoring service)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="text-center p-8 max-w-md">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-zinc-400 mb-6">
                An error occurred. Please try refreshing the page.
              </p>
              <details className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer text-red-400 font-medium mb-2">
                  Error details
                </summary>
                <code className="text-xs text-zinc-400 block overflow-auto max-h-32">
                  {this.state.error?.message}
                </code>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
