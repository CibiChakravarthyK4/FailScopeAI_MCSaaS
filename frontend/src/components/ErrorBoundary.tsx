import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerErrorPage } from '../pages/ServerErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// React error boundaries only catch errors during rendering/lifecycle
// methods, not inside event handlers or async code - that's a React
// limitation, not something this class works around. It's the real
// implementation behind the "friendly 500 page" requirement, not just a
// static route nobody ever sees.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}
