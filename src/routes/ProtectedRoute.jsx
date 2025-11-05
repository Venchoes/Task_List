// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, tokenExpiry } = useAuth();
  const isValid = !!token && !!tokenExpiry && tokenExpiry > Date.now();
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}
