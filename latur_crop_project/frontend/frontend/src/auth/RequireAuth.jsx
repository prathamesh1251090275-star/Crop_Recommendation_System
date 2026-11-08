import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Sends anyone without a live session to /login, remembering where they were
 * heading so the login screen can return them there.
 */
export default function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
