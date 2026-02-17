import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 font-sans">
                    <div className="max-w-2xl w-full bg-gray-900 rounded-2xl p-8 border border-red-500/30">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                        <p className="text-gray-300 mb-6">The application crashed. Here is the error details:</p>

                        <div className="bg-black/50 p-4 rounded-xl overflow-auto custom-scrollbar max-h-[400px]">
                            <p className="text-red-400 font-mono mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-gray-500 text-xs font-mono whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
