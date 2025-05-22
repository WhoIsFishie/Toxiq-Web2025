import {
  Component,
  type ComponentType,
  type GetDerivedStateFromError,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode | ComponentType<{ error: unknown }>;
}

interface ErrorBoundaryState {
  error?: unknown;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  // eslint-disable-next-line max-len
  static getDerivedStateFromError: GetDerivedStateFromError<ErrorBoundaryProps, ErrorBoundaryState> = (error) => ({ error });

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const {
      state: {
        error,
      },
      props: {
        fallback: Fallback,
        children,
      },
    } = this;

    if ('error' in this.state) {
      if (Fallback) {
        return typeof Fallback === 'function' ? <Fallback error={error} /> : Fallback;
      }
      // Default fallback UI
      return (
        <div style={{ padding: '10px', textAlign: 'center', color: 'gray', border: '1px dashed lightgray', margin: '10px 0' }}>
          <p>An error occurred.</p>
        </div>
      );
    }

    return children;
  }
}
