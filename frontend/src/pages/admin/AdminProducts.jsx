import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, Check, Loader2, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    images: 'https://placehold.co/600x400',
    stock: 10
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      
      if (catRes.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catRes.data[0]._id }));
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

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditId(product._id);
      setFormData({
        title: product.title,
        price: product.price,
        description: product.description || '',
        category: product.category?._id || '',
        images: product.images?.[0] || 'https://placehold.co/600x400',
        stock: 10 // Fallback if inventory is not easily fetchable in bulk
      });
      
      // Fetch specific inventory for this product to be precise
      api.get(`/products/${product._id}`).then(res => {
        if(res.data.inventory) {
          setFormData(prev => ({ ...prev, stock: res.data.inventory.stock }));
        }
      });
    } else {
      setEditId(null);
      setFormData({
        title: '',
        price: '',
        description: '',
        category: categories.length > 0 ? categories[0]._id : '',
        images: 'https://placehold.co/600x400',
        stock: 10
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch(err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        images: [formData.images],
        stock: Number(formData.stock)
      };
      
      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
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
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Quản lý Sản phẩm</h1>
          <p style={{ color: 'var(--text-muted)' }}>Xem, thêm và chỉnh sửa các sản phẩm trong kho của bạn.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)' }}>
          <Plus size={20} /> <span style={{ marginLeft: '0.25rem' }}>Thêm Sản phẩm</span>
        </button>
      </div>
      
      <div className="card" style={{ border: 'none', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '5rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>THÔNG TIN SẢN PHẨM</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>DANH MỤC</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>GIÁ NIÊM YẾT</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'white' }}>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                          <img src={p.images?.[0] || 'https://placehold.co/100'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ padding: '0.375rem 0.75rem', borderRadius: 'full', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px' }}>
                        {p.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${p.price?.toLocaleString()}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => handleOpenModal(p)} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(p._id)} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>Không tìm thấy sản phẩm nào.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{editId ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0)'}><X size={24} /></button>
            </div>
            
            <form id="product-form" onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tên sản phẩm</label>
                  <input required type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ví dụ: iPhone 15 Pro Max Titanium" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Giá bán ($)</label>
                  <input required type="number" min="0" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="999" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Số lượng tồn kho</label>
                  <input required type="number" min="0" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Danh mục</label>
                  <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ backgroundColor: 'white' }}>
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Đường dẫn hình ảnh</label>
                  <div style={{ position: 'relative' }}>
                    <input required type="url" className="input-field" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://..." style={{ paddingLeft: '2.5rem' }} />
                    <ImageIcon size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mô tả sản phẩm</label>
                  <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Nhập thông tin chi tiết về sản phẩm..."></textarea>
                </div>
              </div>
            </form>
            
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hủy bỏ</button>
              <button type="submit" form="product-form" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.75rem 2rem', fontWeight: 600, minWidth: '140px' }}>
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editId ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
