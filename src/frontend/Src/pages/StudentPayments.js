import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './StudentPayments.css';

export default function StudentPayments() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPayments();
  }, [user, navigate]);

  const loadPayments = async () => {
    try {
      // Lấy MaSV từ user data
      const userId = user.MaTK || user.id;
      console.log('Loading payments for user ID:', userId);
      const response = await API.get(`/payments/student/${userId}`);
      console.log('Payments loaded:', response.data);
      setPayments(response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePayment = async () => {
    try {
      await API.put(`/payments/${selectedPayment.id}/pay`);
      showNotification('Thanh toán thành công!', 'success');
      setShowPaymentConfirm(false);
      setShowDetailModal(false);
      loadPayments();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unpaidPayments = payments.filter(p => p.status === 'Chưa thanh toán');
  const paidPayments = payments.filter(p => p.status === 'Đã thanh toán');
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);

  return (
    <div className="student-payments">
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
              {user && <Link to="/payments" className="active">Thanh toán</Link>}
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

      {/* Main Content */}
      <main className="main-content">
        <div className="content">
          {/* Payment Stats */}
          <div className="payment-stats">
            <div className="stat-card stat-unpaid">
              <div className="stat-icon">
                <i className="bi bi-exclamation-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{unpaidPayments.length}</h3>
                <p>Hóa đơn chưa thanh toán</p>
                <div className="stat-amount">
                  {totalUnpaid.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
            <div className="stat-card stat-paid">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{paidPayments.length}</h3>
                <p>Hóa đơn đã thanh toán</p>
                <div className="stat-amount">
                  {paidPayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="stat-info">
                <h3>{payments.length}</h3>
                <p>Tổng hóa đơn</p>
                <div className="stat-amount">
                  {payments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          </div>

          {/* Unpaid Payments */}
          {unpaidPayments.length > 0 && (
            <div className="payments-section">
              <h2 className="section-title">
                <i className="bi bi-exclamation-triangle"></i>
                Hóa đơn chưa thanh toán
              </h2>
              <div className="payments-grid">
                {unpaidPayments.map(payment => (
                  <div key={payment.id} className="payment-card unpaid">
                    <div className="payment-header">
                      <div className="payment-month">
                        <i className="bi bi-calendar3"></i>
                        <span>Tháng {payment.month}/{payment.year}</span>
                      </div>
                      <span className="payment-status status-unpaid">Chưa thanh toán</span>
                    </div>
                    <div className="payment-body">
                      <div className="payment-room">
                        <i className="bi bi-door-open"></i>
                        <span>Phòng {payment.roomNumber}</span>
                      </div>
                      <div className="payment-breakdown">
                        <div className="breakdown-item">
                          <span>Tiền phòng:</span>
                          <strong>{parseFloat(payment.roomFee).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div className="breakdown-item">
                          <span>Tiền điện ({payment.electricityUsage} kWh):</span>
                          <strong>{parseFloat(payment.electricityFee).toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div className="breakdown-item">
                          <span>Tiền nước ({payment.waterUsage} m³):</span>
                          <strong>{parseFloat(payment.waterFee).toLocaleString('vi-VN')} đ</strong>
                        </div>
                      </div>
                      <div className="payment-total">
                        <span>Tổng cộng:</span>
                        <strong className="total-amount">{parseFloat(payment.totalAmount).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    </div>
                    <div className="payment-footer">
                      <button 
                        className="btn-detail"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailModal(true);
                        }}
                      >
                        <i className="bi bi-eye"></i> Xem chi tiết
                      </button>
                      <button 
                        className="btn-pay"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentConfirm(true);
                        }}
                      >
                        <i className="bi bi-credit-card"></i> Thanh toán
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paid Payments */}
          {paidPayments.length > 0 && (
            <div className="payments-section">
              <h2 className="section-title">
                <i className="bi bi-check-circle"></i>
                Lịch sử thanh toán
              </h2>
              <div className="payments-grid">
                {paidPayments.map(payment => (
                  <div key={payment.id} className="payment-card paid">
                    <div className="payment-header">
                      <div className="payment-month">
                        <i className="bi bi-calendar3"></i>
                        <span>Tháng {payment.month}/{payment.year}</span>
                      </div>
                      <span className="payment-status status-paid">Đã thanh toán</span>
                    </div>
                    <div className="payment-body">
                      <div className="payment-room">
                        <i className="bi bi-door-open"></i>
                        <span>Phòng {payment.roomNumber}</span>
                      </div>
                      <div className="payment-total">
                        <span>Tổng cộng:</span>
                        <strong>{parseFloat(payment.totalAmount).toLocaleString('vi-VN')} đ</strong>
                      </div>
                      <div className="payment-date">
                        <i className="bi bi-check2-circle"></i>
                        <span>Đã thanh toán: {new Date(payment.paidAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="payment-footer">
                      <button 
                        className="btn-detail"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailModal(true);
                        }}
                      >
                        <i className="bi bi-eye"></i> Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {payments.length === 0 && (
            <div className="empty-state">
              <i className="bi bi-receipt"></i>
              <p>Chưa có hóa đơn nào</p>
              <span>Các hóa đơn thanh toán sẽ hiển thị ở đây</span>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết hóa đơn</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin chung</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tháng/Năm:</label>
                    <span>{selectedPayment.month}/{selectedPayment.year}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phòng:</label>
                    <span>{selectedPayment.roomNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span className={`status-badge ${
                      selectedPayment.status === 'Đã thanh toán' ? 'status-approved' : 'status-pending'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  {selectedPayment.paidAt && (
                    <div className="detail-item">
                      <label>Ngày thanh toán:</label>
                      <span>{new Date(selectedPayment.paidAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Chi tiết thanh toán</h4>
                <div className="payment-breakdown-detail">
                  <div className="breakdown-row">
                    <span>Tiền phòng:</span>
                    <strong>{parseFloat(selectedPayment.roomFee).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>Tiền điện:</span>
                    <div className="breakdown-calc">
                      <span>{selectedPayment.electricityUsage} kWh × 3,000 đ</span>
                      <strong>{parseFloat(selectedPayment.electricityFee).toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                  <div className="breakdown-row">
                    <span>Tiền nước:</span>
                    <div className="breakdown-calc">
                      <span>{selectedPayment.waterUsage} m³ × 15,000 đ</span>
                      <strong>{parseFloat(selectedPayment.waterFee).toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                  <div className="breakdown-row total-row">
                    <span>Tổng cộng:</span>
                    <strong className="total-amount">{parseFloat(selectedPayment.totalAmount).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>

              {selectedPayment.note && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <p className="note-text">{selectedPayment.note}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedPayment.status === 'Chưa thanh toán' && (
                <button 
                  className="btn-pay-modal"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowPaymentConfirm(true);
                  }}
                >
                  <i className="bi bi-credit-card"></i> Thanh toán ngay
                </button>
              )}
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirm && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowPaymentConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="bi bi-credit-card"></i>
            </div>
            <h3>Xác nhận thanh toán</h3>
            <p>Bạn có chắc muốn thanh toán hóa đơn này?</p>
            <div className="confirm-info">
              <div className="info-row">
                <span>Tháng/Năm:</span>
                <strong>{selectedPayment.month}/{selectedPayment.year}</strong>
              </div>
              <div className="info-row">
                <span>Phòng:</span>
                <strong>{selectedPayment.roomNumber}</strong>
              </div>
              <div className="info-row total">
                <span>Số tiền:</span>
                <strong className="amount">{parseFloat(selectedPayment.totalAmount).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel-confirm" onClick={() => setShowPaymentConfirm(false)}>
                Hủy
              </button>
              <button className="btn-confirm-pay" onClick={handlePayment}>
                <i className="bi bi-check-lg"></i> Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
