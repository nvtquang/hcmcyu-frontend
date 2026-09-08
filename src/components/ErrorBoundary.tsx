import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled frontend error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="auth-page">
          <section className="error-box">Da co loi xay ra. Vui long tai lai trang.</section>
        </main>
      );
    }

    return this.props.children;
  }
}
