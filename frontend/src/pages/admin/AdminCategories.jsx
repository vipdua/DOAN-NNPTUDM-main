import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Tag, Loader2 } from 'lucide-react';
import api from '../../api/axios';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });

    const fetchData = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditId(category._id);
            setFormData({
                name: category.name,
                image: category.image || ''
            });
        } else {
            setEditId(null);
            setFormData({
                name: '',
                image: ''
            });
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có muốn xóa danh mục này?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchData();
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, formData);
            } else {
                await api.post('/categories', formData);
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
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quản lý Danh mục</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Tổ chức sản phẩm của bạn vào các danh mục hợp lý.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <Plus size={20} /> <span style={{ marginLeft: '0.25rem' }}>Thêm Danh mục</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat._id} className="card" style={{ overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                <img src={cat.image || 'https://placehold.co/400x200'} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleOpenModal(cat)} style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(cat._id)} style={{ backgroundColor: 'white', color: 'var(--danger)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <Tag size={16} style={{ color: 'var(--primary)' }} />
                                    <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{cat.name}</h3>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {cat.slug}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{editId ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}</h2>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tên danh mục</label>
                                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ví dụ: iPhone 15 Series" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Đường dẫn hình ảnh</label>
                                <input required type="url" className="input-field" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9' }}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editId ? 'Lưu thay đổi' : 'Tạo danh mục')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
