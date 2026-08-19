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
        <div className="min-h-[400px] flex items-center justify-center p-6 font-mono">
          <Card className="max-w-md w-full p-6 text-center space-y-4 border-[#FF2A54] bg-[#121212]">
            <div className="w-12 h-12 rounded-none bg-[#0B0C10] text-[#FF2A54] border border-[#FF2A54] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">SYSTEM EXECUTION EXCEPTION</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed uppercase">
                AN UNEXPECTED RUNTIME EXCEPTION OCCURRED IN THIS MODULE. RELOAD APPLICATION TO RESTORE TELEMETRY.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] text-[10px] font-mono text-[#FF2A54] text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <Button onClick={this.handleReset} variant="primary" className="w-full text-xs uppercase">
              <RefreshCw className="w-4 h-4" />
              <span>RELOAD APPLICATION</span>
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
