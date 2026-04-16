import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut } from 'lucide-react';
import api from '../api/axios';

export default function MainLayout() {
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
    <div className="layout-main">
      <div className="layout-content">
        <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
              BrandShop
            </Link>
            
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/products" className="nav-link">Products</Link>
              {user?.role?.name === 'ADMIN' && (
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              )}
              <Link to="/cart" className="nav-link" style={{ position: 'relative' }}>
                <ShoppingCart size={20} />
              </Link>
              
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Welcome, {user.username}</span>
                  <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={18} /> Sign In
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center' }}>
          <div className="container">
            <p style={{ color: 'var(--text-muted)' }}>&copy; 2026 BrandShop. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
