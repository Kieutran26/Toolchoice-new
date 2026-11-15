import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 bg-card border border-border rounded-lg shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto text-xl font-bold font-mono">
              !
            </div>
            <h2 className="text-lg font-bold text-foreground">Đã xảy ra lỗi giao diện</h2>
            <p className="text-sm text-muted-foreground">
              Rất tiếc, đã có sự cố ngoài ý muốn xảy ra khi hiển thị nội dung này.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-mono font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
              >
                TẢI LẠI TRANG
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-mono font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
              >
                VỀ TRANG CHỦ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
