import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '60px 24px',
            maxWidth: '640px',
            margin: '40px auto',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            {this.props.fallbackMessage ||
              'A rendering error occurred. This can happen if hardware acceleration or WebGL is disabled in your browser.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                background: '#07008F',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
