// components/ErrorBoundary.jsx
import React, { Component } from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.logErrorToServer(error, errorInfo);
    }

    logErrorToServer(error, errorInfo) {
        const errorDetails = {
            content: error.toString() + "\n" + errorInfo.componentStack,
            date: new Date().toISOString()
        };

        fetch('https://66a8916ae40d3aa6ff5881db.mockapi.io/Logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorDetails),
        })
            .catch(err => console.error('Error logging to server:', err));
    }


    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
export default ErrorBoundary;
