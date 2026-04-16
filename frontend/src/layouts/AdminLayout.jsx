import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Home, LogOut, Tag, Shield } from 'lucide-react';
import api from '../api/axios';

export default function AdminLayout() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="layout-main" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid var(--border)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Link to="/admin" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)', padding: '0 0.5rem' }}>
          Quản Trị Viên
        </Link>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
            <LayoutDashboard size={20} /> Tổng Quan
          </Link>
          <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
            <ShoppingBag size={20} /> Sản Phẩm
          </Link>
          <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
            <Tag size={20} /> Danh Mục
          </Link>
          <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
            <Users size={20} /> Người Dùng
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            Đăng nhập là: <strong>{user?.username}</strong>
          </div>
          <button onClick={handleLogout} className="btn" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
            <LogOut size={20} /> Đăng Xuất
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
            <Home size={20} /> Về Cửa Hàng
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>
        <Outlet />
      </div>
    </div>
  );
}
