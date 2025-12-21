import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './About.css';

export default function About() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="about-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/images/logo.png" alt="Logo Trường ĐH Trà Vinh" className="logo-image" />
              <div className="logo-text">
                <h1>KÝ TÚC XÁ</h1>
                <p>Trường Đại Học Trà Vinh</p>
              </div>
            </div>
            <nav className="nav-menu">
              <Link to="/">Trang chủ</Link>
              <Link to="/about" className="active">Giới thiệu</Link>
              <Link to="/support">Hỗ trợ</Link>
              {user && <Link to="/payments">Thanh toán</Link>}
            </nav>
            <div className="header-actions">
              {user ? (
                <>
                  <button onClick={handleLogout} className="btn-login-header">Đăng xuất</button>
                  <Link to="/register" className="btn-register">Đăng ký ở</Link>
                </>
              ) : (
                <Link to="/login" className="btn-login-header">Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <p className="about-label">VỀ CHÚNG TÔI</p>
              <h2 className="about-title">Ký túc xá hiện đại phục vụ sinh viên</h2>
              
              <p className="about-description">
                Ký túc xá Trường Đại học Trà Vinh được xây dựng với mục tiêu tạo ra 
                một môi trường sống lý tưởng cho sinh viên. Chúng tôi không chỉ cung 
                cấp chỗ ở mà còn là nơi để các bạn sinh viên phát triển toàn diện.
              </p>
              
              <p className="about-description">
                Với đội ngũ quản lý chuyên nghiệp, cơ sở vật chất hiện đại và các 
                dịch vụ tiện ích đầy đủ, ký túc xá Trà Vinh cam kết mang đến trải nghiệm 
                sống tốt nhất cho mọi sinh viên.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-check">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <div className="feature-text">
                    <h4>An ninh nghiêm ngặt</h4>
                    <p>Hệ thống camera giám sát 24/7, bảo vệ túc trực</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-check">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Vệ sinh sạch sẽ</h4>
                    <p>Dọn dẹp khu vực chung hàng ngày, phòng ở định kỳ</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-check">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <div className="feature-text">
                    <h4>Hỗ trợ tận tình</h4>
                    <p>Đội ngũ nhân viên sẵn sàng hỗ trợ mọi lúc</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-images">
              <div className="image-item image-large">
                <img src="/images/Ảnh giới thiệu 1.png" alt="Cổng ký túc xá" />
              </div>
              <div className="image-item image-small">
                <img src="/images/Ảnh giới thiệu 2.png" alt="Cửa hàng tiện ích" />
              </div>
              <div className="image-item image-medium">
                <img src="/images/Ảnh giới thiệu 3.png" alt="Phòng ở" />
              </div>
              <div className="image-item image-medium">
                <img src="/images/Ảnh giới thiệu 4.png" alt="Phòng ở" />
              </div>
              
              <div className="experience-badge">
                <h3>10+</h3>
                <p>Năm kinh nghiệm</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
