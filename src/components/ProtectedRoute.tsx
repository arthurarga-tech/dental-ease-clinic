import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'dentist' | 'dentista' | 'secretaria';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  if (requiredRole) {
    // If a specific role is required and user doesn't have it
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      let redirectPath = '/';
      if (userRole === 'dentist' || userRole === 'dentista') {
        redirectPath = '/dentist-dashboard';
      } else if (userRole === 'secretaria') {
        redirectPath = '/secretary-dashboard';
      }
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};
