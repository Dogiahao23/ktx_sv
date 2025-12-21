import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './Register.css';

export default function Register() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    address: '',
    idCardFront: null,
    studentCard: null,
    agreeTerms: false
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    });
  };

  const handleDateSelect = (date) => {
    const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    setFormData({ ...formData, birthDate: formatted });
    setShowDatePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      showNotification('Vui lòng đồng ý với điều khoản và quy định', 'error');
      return;
    }
    
    console.log('📝 Form data before submit:', formData);
    console.log('birthDate:', formData.birthDate);
    
    try {
      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('studentId', formData.studentId);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('gender', formData.gender);
      submitData.append('birthDate', formData.birthDate);
      submitData.append('address', formData.address);
      
      // Thêm file nếu có
      if (formData.idCardFront) {
        submitData.append('idCardFront', formData.idCardFront);
      }
      if (formData.studentCard) {
        submitData.append('studentCard', formData.studentCard);
      }
      
      // Gửi đơn đăng ký với FormData
      await API.post('/registrations', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showNotification('Đăng ký thành công! Đơn của bạn đang chờ xét duyệt. Bạn sẽ nhận được thông báo qua email khi đơn được duyệt.', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      showNotification(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <div className="register-page">
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
              {user ? (
                <>
                  <button onClick={handleLogout} className="btn-login-header">Đăng xuất</button>
                  <Link to="/register" className="btn-register active">Đăng ký ở</Link>
                </>
              ) : (
                <Link to="/login" className="btn-login-header">Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <section className="register-section">
        <div className="container">
          <div className="register-form-wrapper">
            <h2 className="form-title">Vui lòng điền đầy đủ thông tin để đăng ký ký túc xá</h2>
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
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
                  <label>Mã sinh viên <span className="required">*</span></label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="Nhập mã sinh viên"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giới tính <span className="required">*</span></label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày sinh <span className="required">*</span></label>
                  <div className="date-input-wrapper">
                    <input
                      type="text"
                      name="birthDate"
                      placeholder="mm/dd/yyyy"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      readOnly
                    />
                    <button
                      type="button"
                      className="calendar-btn"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <i className="bi bi-calendar3"></i>
                    </button>
                  </div>
                  {showDatePicker && (
                    <div className="date-picker-overlay" onClick={() => setShowDatePicker(false)}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DatePicker
                          selectedDate={selectedDate}
                          onDateSelect={handleDateSelect}
                          onClose={() => setShowDatePicker(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Địa chỉ thường trú <span className="required">*</span></label>
                <input
                  type="text"
                  name="address"
                  placeholder="Nhập địa chỉ thường trú"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="upload-section">
                <h3><i className="bi bi-file-earmark-arrow-up"></i> Tải Lên Giấy Tờ</h3>
                
                <div className="upload-item">
                  <label className="upload-label">
                    <input
                      type="file"
                      name="idCardFront"
                      accept="image/jpeg,image/png"
                      onChange={handleChange}
                      hidden
                    />
                    <div className={`upload-box ${formData.idCardFront ? 'has-file' : ''}`}>
                      <i className="bi bi-cloud-upload"></i>
                      <p className="upload-title">Ảnh CMND/CCCD</p>
                      {formData.idCardFront ? (
                        <p className="upload-hint" style={{ color: '#1e6fef', fontWeight: '600' }}>
                          <i className="bi bi-check-circle-fill"></i> {formData.idCardFront.name}
                        </p>
                      ) : (
                        <p className="upload-hint">Kéo thả hoặc click để chọn file (JPG, PNG)</p>
                      )}
                    </div>
                  </label>
                </div>

                <div className="upload-item">
                  <label className="upload-label">
                    <input
                      type="file"
                      name="studentCard"
                      accept="image/jpeg,image/png"
                      onChange={handleChange}
                      hidden
                    />
                    <div className={`upload-box ${formData.studentCard ? 'has-file' : ''}`}>
                      <i className="bi bi-cloud-upload"></i>
                      <p className="upload-title">Ảnh Thẻ Sinh Viên</p>
                      {formData.studentCard ? (
                        <p className="upload-hint" style={{ color: '#1e6fef', fontWeight: '600' }}>
                          <i className="bi bi-check-circle-fill"></i> {formData.studentCard.name}
                        </p>
                      ) : (
                        <p className="upload-hint">Kéo thả hoặc click để chọn file (JPG, PNG)</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms">
                  Tôi xác nhận rằng tất cả thông tin được cung cấp là chính xác và đầy đủ. Tôi đã đọc và đồng ý với các <span className="link-text">điều khoản</span> và <span className="link-text">quy định</span> của ký túc xá Trường Đại Học Trà Vinh.
                </label>
              </div>

              <button type="submit" className="btn-submit-register">
                <i className="bi bi-send"></i> Gửi đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// Date Picker Component
function DatePicker({ selectedDate, onDateSelect, onClose }) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button type="button" onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
        <span>{monthNames[month]}, {year}</span>
        <button type="button" onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
      </div>
      <div className="date-picker-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`date-cell ${day ? 'active' : ''} ${day === 1 ? 'selected' : ''}`}
            onClick={() => day && onDateSelect(new Date(year, month, day))}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="date-picker-actions">
        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
        <button type="button" onClick={() => onDateSelect(currentDate)} className="btn-save">Lưu</button>
      </div>
    </div>
  );
}
