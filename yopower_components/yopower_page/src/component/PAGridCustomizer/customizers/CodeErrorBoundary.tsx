import * as React from "react";

interface ICodeErrorBoundaryProps {
    value: string;
    fallback: React.ReactNode;
    children?: React.ReactNode;
}

interface ICodeErrorBoundaryState {
    hasError: boolean;
}

// jsbarcode / qrcode throw on values they cannot encode (wrong format, too long), keep the grid alive
export class CodeErrorBoundary extends React.Component<ICodeErrorBoundaryProps, ICodeErrorBoundaryState> {
    state: ICodeErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ICodeErrorBoundaryState {
        return { hasError: true };
    }

    componentDidUpdate(prevProps: ICodeErrorBoundaryProps) {
        if (prevProps.value !== this.props.value && this.state.hasError)
            this.setState({ hasError: false });
    }

    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}
