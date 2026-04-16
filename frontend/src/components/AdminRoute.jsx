import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role?.name === 'ADMIN') {
      return <Outlet />;
    }
    // Nếu không phải ADMIN, đá về trang chủ
    return <Navigate to="/" replace />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
}
