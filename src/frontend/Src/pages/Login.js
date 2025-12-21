import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load saved credentials on mount
  React.useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await API.post('/auth/login', { username, password });
      
      // Lưu thông tin user đầy đủ
      const userData = {
        MaTK: res.data.id,
        TenDangNhap: res.data.username,
        VaiTro: res.data.role,
        token: res.data.token
      };
      login(res.data.token, userData);
      
      // Lưu thông tin đăng nhập nếu "Ghi nhớ" được chọn
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }
      
      // Hiển thị thông báo thành công
      showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      // Chờ 1.5s rồi chuyển hướng theo role
      setTimeout(() => {
        if (res.data.role === 'Admin') {
          navigate('/admin');
        } else if (res.data.role === 'QuanLy') {
          navigate('/manager');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      
      // Kiểm tra nếu tài khoản bị khóa
      if (err.response?.status === 403 && err.response?.data?.locked) {
        showNotification('🔒 ' + err.response.data.message, 'error');
      } else {
        showNotification(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', 'error');
      }
    }
  };

  return (
    <div className="login-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

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
            </nav>
            <div className="header-actions">
              <Link to="/login" className="btn-login-header active">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Login Section */}
      <section className="login-section">
        <div className="container">
          <div className="login-wrapper">
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon">
                  <i className="bi bi-person-circle"></i>
                </div>
                <h2>Đăng nhập</h2>
                <p>Chào mừng bạn quay trở lại!</p>
              </div>

              <form onSubmit={submit} className="login-form">
                <div className="form-group">
                  <label>Tên đăng nhập hoặc Email</label>
                  <div className="input-wrapper">
                    <i className="bi bi-person"></i>
                    <input
                      type="text"
                      placeholder="Nhập tên đăng nhập hoặc email"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <i className="bi bi-lock"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="forgot-password">Quên mật khẩu?</a>
                </div>

                <button type="submit" className="btn-login" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>
            </div>

            <div className="login-info">
              <div className="info-content">
                <h3>Hệ thống quản lý Ký túc xá</h3>
                <p>Trường Đại học Trà Vinh</p>
                <div className="info-features">
                  <div className="info-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Đăng ký phòng ở trực tuyến</span>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Quản lý hợp đồng dễ dàng</span>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Thanh toán tiện lợi</span>
                  </div>
                  <div className="info-item">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
