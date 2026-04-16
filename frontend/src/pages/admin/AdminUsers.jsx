import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, User as UserIcon, Shield, Mail, Loader2 } from 'lucide-react';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });

  const fetchData = async () => {
    try {
      const [userRes, roleRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      setUsers(userRes.data);
      setRoles(roleRes.data);
      
      if (roleRes.data.length > 0 && !formData.role) {
        // Find USER role by default if exists
        const userRole = roleRes.data.find(r => r.name === 'USER');
        setFormData(prev => ({ ...prev, role: userRole?._id || roleRes.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditId(user._id);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role?._id || ''
      });
    } else {
      setEditId(null);
      const userRole = roles.find(r => r.name === 'USER');
      setFormData({
        username: '',
        email: '',
        password: '',
        role: userRole?._id || (roles.length > 0 ? roles[0]._id : '')
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn vô hiệu hóa tài khoản này?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editId) {
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quản lý Người dùng</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quản lý tài khoản và phân quyền truy cập hệ thống.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <Plus size={20} /> <span style={{ marginLeft: '0.25rem' }}>Thêm Người dùng</span>
        </button>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-lg)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>NGƯỜI DÙNG</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>EMAIL</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>VAI TRÒ</th>
                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'white' }}>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', opacity: u.isDeleted ? 0.6 : 1, transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                        <UserIcon size={20} />
                      </div>
                      <div style={{ fontWeight: 600 }}>{u.username} {u.isDeleted && <span style={{ color: 'var(--danger)', fontSize: '0.7rem' }}>(Disabled)</span>}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.375rem 0.75rem', 
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: u.role?.name === 'ADMIN' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: u.role?.name === 'ADMIN' ? 'var(--primary)' : 'var(--text-secondary)',
                      border: '1px solid currentColor'
                    }}>
                      {u.role?.name || 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => handleOpenModal(u)} style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><Edit size={18} /></button>
                      {u.role?.name !== 'ADMIN' && !u.isDeleted && (
                        <button onClick={() => handleDelete(u._id)} style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editId ? 'Sửa Người dùng' : 'Thêm Người dùng mới'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tên đăng nhập</label>
                <div style={{ position: 'relative' }}>
                  <input required type="text" className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ paddingLeft: '2.5rem' }} />
                  <UserIcon size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ paddingLeft: '2.5rem' }} />
                  <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mật khẩu {editId && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(bỏ trống nếu không đổi)</span>}</label>
                <input required={!editId} type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Vai trò</label>
                <div style={{ position: 'relative' }}>
                  <select required className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ paddingLeft: '2.5rem', backgroundColor: 'white' }}>
                    <option value="" disabled>-- Chọn vai trò --</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                  <Shield size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editId ? 'Cập nhật' : 'Tạo người dùng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
