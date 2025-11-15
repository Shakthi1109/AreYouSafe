/**
 * Composant de protection de route - Redirige vers login si non authentifié
 */
import { Navigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  // Si non authentifié, rediriger vers login
  if (!authenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers la page appropriée selon le rôle
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  return <>{children}</>;
}

