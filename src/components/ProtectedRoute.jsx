import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Route guard component with role-based access control.
 * Wraps route groups to enforce authentication and role requirements.
 * Uses React Router's Outlet pattern for clean composition.
 *
 * @param {Object} props
 * @param {string[]} [props.allowedRoles] - Roles permitted to access child routes
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect unauthenticated users to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect users without the required role to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const fallback =
      user?.role === 'subordinate' ? '/subordinate-dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
