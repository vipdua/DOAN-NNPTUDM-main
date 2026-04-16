import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Zap, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        color: 'white', 
        padding: '8rem 1rem', 
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '80%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50%', height: '70%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
            <Zap size={16} style={{ color: '#fbbf24' }} />
            <span>Thế hệ iPhone mới nhất đã cập bến</span>
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
            Nâng tầm trải nghiệm <br />
            <span style={{ background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Công nghệ tương lai</span>
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.8, maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
            Khám phá những siêu phẩm Apple được tuyển chọn kỹ lưỡng, mang đến cho bạn sự sang trọng, tinh tế và hiệu năng đỉnh cao nhất.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)' }}>
              Mua Ngay <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'transparent', color: 'white' }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '8rem 1rem', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Tại sao chọn chúng tôi?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Dịch vụ tận tâm, sản phẩm chính hãng, trải nghiệm khác biệt.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {[
              { icon: <Truck size={36} />, title: "Giao Hàng Siêu Tốc", desc: "Nhận sản phẩm ngay trước cửa nhà bạn chỉ trong 24-48 giờ với quy trình đóng gói chuyên nghiệp." },
              { icon: <ShieldCheck size={36} />, title: "Bảo Mật Tuyệt Đối", desc: "Hệ thống thanh toán được mã hóa đa lớp, đảm bảo mọi giao dịch của bạn luôn an toàn 100%." },
              { icon: <Star size={36} />, title: "Hàng Chính Hãng 100%", desc: "Cam kết chỉ phân phối các dòng sản phẩm Apple chính hãng, đầy đủ hóa đơn và bảo hành toàn quốc." }
            ].map((feature, idx) => (
              <div key={idx} className="card" style={{ padding: '3rem 2rem', textAlign: 'center', border: 'none', boxShadow: 'var(--shadow-md)', transition: 'all 0.3s' }} onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }} onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}>
                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', transform: 'rotate(-5deg)' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ paddingBottom: '8rem' }}>
         <div className="container" style={{ padding: '4rem', backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-xl)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tham gia cùng 10,000+ tín đồ iPhone</h2>
              <p style={{ opacity: 0.9 }}>Nhận ngay thông báo về các ưu đãi độc quyền sớm nhất.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Email của bạn..." style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: 'none', minWidth: '300px' }} />
              <button className="btn" style={{ backgroundColor: 'var(--text-primary)', color: 'white', fontWeight: 700, padding: '0 2rem' }}>Đăng ký</button>
            </div>
         </div>
      </section>
    </div>
  );
}
