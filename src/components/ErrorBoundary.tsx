
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shamcash-light via-white to-shamcash-primary/5">
          <div className="text-center">
            <div className="shamcash-card p-8 text-red-600 max-w-md">
              <h2 className="text-xl font-semibold mb-4">حدث خطأ غير متوقع</h2>
              <p className="text-shamcash-gray-600 mb-4">
                نعتذر، حدث خطأ في المنصة. يرجى إعادة تحميل الصفحة.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-shamcash-primary text-white rounded-lg hover:bg-shamcash-secondary transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
              {this.state.error && (
                <details className="mt-4 text-left text-xs text-gray-500">
                  <summary className="cursor-pointer">تفاصيل الخطأ</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
