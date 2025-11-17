import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

export default ProtectedRoute;