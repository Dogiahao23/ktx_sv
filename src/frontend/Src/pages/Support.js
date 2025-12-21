import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './Support.css';

export default function Support() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập
    if (!user) {
      // Chuyển đến trang đăng nhập nếu chưa đăng nhập
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      await API.post('/support-requests', formData);
      setShowSuccessModal(true);
      setFormData({ fullName: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-page">
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
              <Link to="/support" className="active">Hỗ trợ</Link>
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

      {/* Support Section */}
      <section className="support-section">
        <div className="container">
          <div className="support-content">
            <div className="support-info">
              <h2>Liên hệ với chúng tôi</h2>
              <p>Có thắc mắc hay cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn.</p>

              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Địa chỉ</h3>
                    <p>126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Điện thoại</h3>
                    <p>(0294) 3855 246</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <p>ktx@tvu.edu.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="support-form-wrapper">
              <h3>Liên hệ hỗ trợ</h3>
              {!user && (
                <div className="login-required-notice">
                  <i className="bi bi-info-circle-fill"></i>
                  <span>Bạn cần <strong>đăng nhập</strong> để gửi yêu cầu hỗ trợ</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Tin nhắn</label>
                  <textarea
                    name="message"
                    placeholder="Tin nhắn"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit-support" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : (user ? 'Gửi tin nhắn' : 'Đăng nhập để gửi')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="support-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-wrapper">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi yêu cầu của bạn trong thời gian sớm nhất.</p>
            <div className="success-info">
              <i className="bi bi-envelope-check"></i>
              <span>Thông tin đã được gửi đến email: <strong>ktx@tvu.edu.vn</strong></span>
            </div>
            <button 
              className="btn-close-success"
              onClick={() => setShowSuccessModal(false)}
            >
              <i className="bi bi-check-lg"></i> Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="support-error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-icon">
              <i className="bi bi-exclamation-circle-fill"></i>
            </div>
            <h3>Có lỗi xảy ra!</h3>
            <p>{errorMessage}</p>
            <button 
              className="btn-close-error"
              onClick={() => setShowErrorModal(false)}
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
