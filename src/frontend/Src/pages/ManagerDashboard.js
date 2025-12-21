import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './ManagerDashboard.css';

export default function ManagerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [supportRequests, setSupportRequests] = useState([]);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!user || user.VaiTro !== 'QuanLy') {
      navigate('/');
      return;
    }
    loadSupportRequests();
  }, [user, navigate]);

  const loadSupportRequests = async () => {
    try {
      const response = await API.get('/support-requests');
      setSupportRequests(response.data);
    } catch (error) {
      console.error('Error loading support requests:', error);
      setSupportRequests([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await API.put(`/support-requests/${requestId}/status`, {
        status: newStatus
      });
      loadSupportRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      try {
        await API.delete(`/support-requests/${requestId}`);
        loadSupportRequests();
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Không thể xóa yêu cầu');
      }
    }
  };

  return (
    <div className="manager-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/images/logo.png" alt="Logo" className="logo-image" />
            <div>
              <h2>KÝ TÚC XÁ</h2>
              <p>Quản lý</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <i className="bi bi-headset"></i>
            <span>Yêu cầu hỗ trợ</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>Yêu cầu hỗ trợ</h1>
          <div className="user-info">
            <i className="bi bi-person-circle"></i>
            <span>{user?.TenDangNhap}</span>
          </div>
        </header>

        <div className="content">
          {/* Support Stats */}
          <div className="support-stats">
            <div className="stat-card stat-pending">
              <div className="stat-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="stat-info">
                <h3>{supportRequests.filter(r => r.TrangThai === 'Chờ xử lý').length}</h3>
                <p>Chờ xử lý</p>
              </div>
            </div>
            <div className="stat-card stat-processing">
              <div className="stat-icon">
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div className="stat-info">
                <h3>{supportRequests.filter(r => r.TrangThai === 'Đang xử lý').length}</h3>
                <p>Đang xử lý</p>
              </div>
            </div>
            <div className="stat-card stat-completed">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{supportRequests.filter(r => r.TrangThai === 'Đã xử lý').length}</h3>
                <p>Đã xử lý</p>
              </div>
            </div>
          </div>

          {supportRequests.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-headset"></i>
              <p>Chưa có yêu cầu hỗ trợ nào</p>
              <span>Các yêu cầu hỗ trợ từ sinh viên sẽ hiển thị ở đây</span>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Tin nhắn</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {supportRequests.map(request => (
                    <tr key={request.MaYeuCau}>
                      <td><strong>{request.HoTen}</strong></td>
                      <td>{request.Email}</td>
                      <td>{request.SoDienThoai || 'N/A'}</td>
                      <td>
                        <div className="message-cell">
                          {request.TinNhan}
                        </div>
                      </td>
                      <td>
                        <select
                          value={request.TrangThai}
                          onChange={(e) => handleStatusChange(request.MaYeuCau, e.target.value)}
                          className={`status-select ${
                            request.TrangThai === 'Chờ xử lý' ? 'status-pending' : 
                            request.TrangThai === 'Đang xử lý' ? 'status-processing' : 
                            'status-completed'
                          }`}
                        >
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đang xử lý">Đang xử lý</option>
                          <option value="Đã xử lý">Đã xử lý</option>
                        </select>
                      </td>
                      <td>{new Date(request.NgayTao).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(request.MaYeuCau)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
