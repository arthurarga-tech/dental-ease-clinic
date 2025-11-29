import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("Unhandled application error:", error, info);
  }

  handleGoToLogin = () => {
    window.location.href = "/auth";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Ocorreu um erro inesperado
          </h1>
          <p className="text-muted-foreground max-w-md">
            Vamos te redirecionar para a tela de login para que você possa continuar
            utilizando o sistema normalmente.
          </p>
          <button
            onClick={this.handleGoToLogin}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Voltar para o login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
