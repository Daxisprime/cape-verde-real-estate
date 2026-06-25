'use client';

import React, { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return React.createElement(FallbackComponent, {
          error: this.state.error,
          reset: this.reset,
        });
      }

      return React.createElement(
        'div',
        { className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4' },
        React.createElement(
          'div',
          { className: 'max-w-lg w-full bg-white rounded-lg shadow-md border p-6' },
          React.createElement(
            'div',
            { className: 'flex items-center text-red-600 mb-4' },
            React.createElement(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                className: 'h-6 w-6 mr-2',
                fill: 'none',
                viewBox: '0 0 24 24',
                stroke: 'currentColor',
              },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
              })
            ),
            React.createElement('h2', { className: 'text-xl font-semibold' }, 'Something went wrong')
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-6' },
            'We encountered an unexpected error. Please try refreshing the page.'
          ),
          React.createElement(
            'div',
            { className: 'flex space-x-3' },
            React.createElement(
              'button',
              {
                onClick: this.reset,
                className:
                  'flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
              },
              'Try Again'
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  window.location.href = '/';
                },
                className:
                  'flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors',
              },
              'Go Home'
            )
          ),
          React.createElement(
            'p',
            { className: 'text-sm text-gray-500 text-center mt-4' },
            'If this problem persists, please contact ',
            React.createElement(
              'a',
              { href: 'mailto:support@procv.cv', className: 'text-blue-600 hover:underline' },
              'support@procv.cv'
            )
          )
        )
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center min-h-[400px] p-8' },
    React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        className: 'h-12 w-12 text-red-500 mb-4',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      })
    ),
    React.createElement(
      'h2',
      { className: 'text-xl font-semibold text-gray-900 mb-2' },
      'Oops! Something went wrong'
    ),
    React.createElement(
      'p',
      { className: 'text-gray-600 text-center mb-6 max-w-md' },
      'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'
    ),
    React.createElement(
      'div',
      { className: 'flex space-x-4' },
      React.createElement(
        'button',
        {
          onClick: reset,
          className: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors',
        },
        'Try Again'
      ),
      React.createElement(
        'button',
        {
          onClick: () => window.location.reload(),
          className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors',
        },
        'Refresh Page'
      )
    )
  );
}

export default ErrorBoundary;
