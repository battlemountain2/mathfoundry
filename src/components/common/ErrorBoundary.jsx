import React from 'react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center text-2xl font-mono mb-4">
            !
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mb-2">
            Runtime Exception Captured
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mb-4">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
            <Button
              variant="primary"
              onClick={this.handleReset}
            >
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
