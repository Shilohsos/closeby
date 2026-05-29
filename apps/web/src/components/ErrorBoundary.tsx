import React from 'react';

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            {import.meta.env.DEV && (
              <pre className="text-xs text-muted-foreground bg-secondary p-3 rounded-lg text-left overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ error: null })}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
