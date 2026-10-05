import { Component, ErrorInfo, ReactNode } from "react";

import styles from "./ErrorBoundary.module.scss";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className={styles.wrapper}>
                    <p className={styles.text}>
                        Что-то пошло не так
                    </p>
                    <p className={styles.subtext}>
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={this.reset}
                        className={styles.button}
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
