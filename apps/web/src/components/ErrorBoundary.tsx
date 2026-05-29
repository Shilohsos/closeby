import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md w-full space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            {import.meta.env.DEV && (
              <p className="text-sm text-muted-foreground font-mono text-left bg-secondary rounded-lg p-3 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.reset}
              className="mt-2 bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
