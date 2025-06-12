import { Navigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); //роль сохраняется при логине
  const { addToast } = useToast();

  if (!isAuthenticated) {
    addToast('You need to login to access this page', 'warning');
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    addToast('You don\'t have permission to access this page', 'error');
    return <Navigate to="/menu" replace />;
  }
  
  return children;
};

export default ProtectedRoute;