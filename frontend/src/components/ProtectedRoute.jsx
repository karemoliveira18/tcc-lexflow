import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ isAuthenticated, user, children, requiredProfile = null, redirectTo = '/login' }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (requiredProfile && user?.perfil !== requiredProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
