import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function isAdminUser(user) {
  const roles = user?.roles || user?.Roles || [];

  return roles.some((role) => {
    const normalized = String(role).toLowerCase();

    return normalized === 'administrator' ||
      normalized === 'admin' ||
      normalized === 'администратор';
  });
}

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}