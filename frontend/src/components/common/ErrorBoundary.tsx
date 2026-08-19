import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#0D0D0D]">
          <Card className="max-w-md w-full p-6 text-center space-y-4 border-[#FF2A54]/40 bg-[#1A1F26] rounded-none">
            <div className="w-12 h-12 rounded-none bg-[#FF2A54]/10 text-[#FF2A54] border border-[#FF2A54]/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-mono uppercase">System Exception Detected</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                An unexpected error occurred in this view. You can reload the application or return to the dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-none bg-[#0D0D0D] border border-[#252b36] text-[11px] font-mono text-rose-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <Button onClick={this.handleReset} variant="primary" className="w-full">
              <RefreshCw className="w-4 h-4" />
              <span className="font-mono">Reload Application</span>
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


