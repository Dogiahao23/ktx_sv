import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="home-page">
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
              <Link to="/about">Giới thiệu</Link>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-subtitle">Môi trường sống hiện đại & an toàn</p>
              <h2 className="hero-title">
                Ký Túc Xá <span className="text-yellow">Trường<br />Đại Học Trà Vinh</span>
              </h2>
              <p className="hero-description">
                Không gian sống tiện nghi, đầy đủ tiện ích, phục vụ tốt nhất<br />
                cho sinh viên trong suốt quá trình học tập và rèn luyện
              </p>
              <div className="hero-buttons">
                {user ? (
                  <Link to="/register" className="btn btn-primary">
                    <i className="bi bi-pencil-square"></i> Đăng ký ngay
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right"></i> Đăng nhập để đăng ký
                  </Link>
                )}
                <Link to="/about" className="btn btn-outline">
                  <i className="bi bi-info-circle"></i> Tìm hiểu thêm
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="/images/Ảnh trang chủ.png" alt="Ký túc xá Trường ĐH Trà Vinh" />
            </div>
          </div>
          
          {/* Stats */}
          <div className="stats">
            <div className="stat-item">
              <h3>12000+</h3>
              <p>Sinh viên</p>
            </div>
            <div className="stat-item">
              <h3>3000+</h3>
              <p>Phòng ở</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Hỗ trợ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại sao chọn KTX chúng tôi?</h2>
          <p className="section-subtitle">
            Với đầy đủ tiện nghi và dịch vụ chất lượng, chúng tôi cam kết mang đến môi trường sống tốt nhất
          </p>
          
          <div className="features-grid">
            <div className="feature-card feature-blue">
              <div className="feature-icon">
                <i className="bi bi-wifi"></i>
              </div>
              <h3>WiFi tốc độ cao</h3>
              <p>Kết nối internet tốc độ cao<br />phù hợp sử dụng toàn bộ khu ký túc<br />xá</p>
            </div>
            
            <div className="feature-card feature-green">
              <div className="feature-icon">
                <i className="bi bi-snow"></i>
              </div>
              <h3>Điều hòa đầy đủ</h3>
              <p>Tất cả phòng ở đều được<br />trang bị điều hòa mát đầy đủ<br />hiện đại</p>
            </div>
            
            <div className="feature-card feature-orange">
              <div className="feature-icon">
                <i className="bi bi-cash-coin"></i>
              </div>
              <h3>Căn tin tiện lợi</h3>
              <p>Thực đơn đa dạng, giá cả<br />phải chăng phục vụ 3 bữa/<br />ngày</p>
            </div>
            
            <div className="feature-card feature-purple">
              <div className="feature-icon">
                <i className="bi bi-trophy"></i>
              </div>
              <h3>Khu thể thao</h3>
              <p>Sân bóng, phòng gym, khu<br />vui chơi giải trí đầy đủ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
