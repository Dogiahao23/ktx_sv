import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PaymentsTab from '../components/PaymentsTab';
import RegistrationChart from '../components/RegistrationChart';
import CustomSelect from '../components/CustomSelect';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    approvedRegistrations: 0,
    pendingRegistrations: 0,
    rejectedRegistrations: 0
  });
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [studentsInRoom, setStudentsInRoom] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRoomDetailModal, setShowRoomDetailModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteSupportConfirm, setShowDeleteSupportConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [deleteSupportTarget, setDeleteSupportTarget] = useState(null);
  const [notification, setNotification] = useState(null);
  const [registrationFilter, setRegistrationFilter] = useState('all');
  
  // Chart data
  const [registrationChartData, setRegistrationChartData] = useState([]);
  
  // Payment states
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ totalInvoices: 0, unpaidCount: 0, paidCount: 0, unpaidAmount: 0, paidAmount: 0 });
  const [studentsWithRooms, setStudentsWithRooms] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    roomFee: 0,
    electricityFee: 0,
    waterFee: 0,
    electricityUsage: 0,
    waterUsage: 0,
    note: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Filter registrations based on selected filter
  const filteredRegistrations = registrations.filter(reg => {
    if (registrationFilter === 'all') return true;
    if (registrationFilter === 'pending') return reg.status === 'pending';
    if (registrationFilter === 'approved') return reg.status === 'approved';
    if (registrationFilter === 'rejected') return reg.status === 'rejected';
    return true;
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [passwordData, setPasswordData] = useState({ userId: null, username: '', newPassword: '' });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ building: '', roomNumber: '', capacity: 4, price: 1500000 });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      // Load statistics from API
      try {
        const statsResponse = await API.get('/stats');
        console.log('Stats loaded:', statsResponse.data);
        setStats({
          totalStudents: statsResponse.data.totalStudents || 0,
          totalRooms: statsResponse.data.totalRooms || 0,
          approvedRegistrations: statsResponse.data.approvedRegistrations || 0,
          pendingRegistrations: statsResponse.data.pendingRegistrations || 0,
          rejectedRegistrations: statsResponse.data.rejectedRegistrations || 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to default values if API fails
        setStats({
          totalStudents: 0,
          totalRooms: 0,
          approvedRegistrations: 0,
          pendingRegistrations: 0,
          rejectedRegistrations: 0
        });
      }

      // Load chart data for overview
      if (activeTab === 'overview') {
        try {
          const chartResponse = await API.get('/statistics/registrations-by-month');
          console.log('Chart data loaded:', chartResponse.data);
          setRegistrationChartData(chartResponse.data);
        } catch (error) {
          console.error('Error loading chart data:', error);
          setRegistrationChartData([]);
        }
      }

      // Load registrations from API
      if (activeTab === 'registrations') {
        try {
          const regsResponse = await API.get('/registrations');
          console.log('Registrations loaded:', regsResponse.data);
          setRegistrations(regsResponse.data);
        } catch (error) {
          console.error('Error loading registrations:', error);
          setRegistrations([]);
        }
      }

      // Load users
      if (activeTab === 'users') {
        try {
          const response = await API.get('/users');
          console.log('Users loaded:', response.data);
          setUsers(response.data);
        } catch (error) {
          console.error('Error loading users:', error);
          alert('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối backend.');
          setUsers([]);
        }
      }

      // Load rooms
      if (activeTab === 'rooms') {
        try {
          const roomsResponse = await API.get('/rooms');
          console.log('Rooms loaded:', roomsResponse.data);
          setRooms(roomsResponse.data);

          const studentsResponse = await API.get('/rooms/approved-students');
          console.log('Approved students loaded:', studentsResponse.data);
          setApprovedStudents(studentsResponse.data);
        } catch (error) {
          console.error('Error loading rooms:', error);
          setRooms([]);
          setApprovedStudents([]);
        }
      }

      // Load payments
      if (activeTab === 'payments') {
        try {
          const paymentsResponse = await API.get('/payments');
          console.log('Payments loaded:', paymentsResponse.data);
          setPayments(paymentsResponse.data);

          const statsResponse = await API.get('/payments/stats');
          console.log('Payment stats loaded:', statsResponse.data);
          setPaymentStats(statsResponse.data);

          const studentsResponse = await API.get('/payments/students-with-rooms');
          console.log('Students with rooms loaded:', studentsResponse.data);
          setStudentsWithRooms(studentsResponse.data);
        } catch (error) {
          console.error('Error loading payments:', error);
          setPayments([]);
        }
      }

      // Load support requests (for QuanLy and Admin roles)
      console.log('Checking support tab:', { activeTab, userRole: user?.VaiTro });
      if (activeTab === 'support' && (user?.VaiTro === 'QuanLy' || user?.VaiTro === 'Admin')) {
        try {
          console.log('Loading support requests...');
          const supportResponse = await API.get('/support-requests');
          console.log('Support requests loaded:', supportResponse.data);
          setSupportRequests(supportResponse.data);
        } catch (error) {
          console.error('Error loading support requests:', error);
          setSupportRequests([]);
        }
      } else {
        console.log('Not loading support - condition not met');
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogout = () => {
    logout(); // Sử dụng logout từ AuthContext
    navigate('/');
  };

  const handleApproveRegistration = async (id) => {
    setConfirmTarget({
      message: 'Bạn có chắc muốn duyệt đơn đăng ký này?',
      info: 'Sinh viên sẽ nhận được thông báo qua email.',
      onConfirm: async () => {
        try {
          await API.put(`/registrations/${id}/approve`);
          const regsResponse = await API.get('/registrations');
          setRegistrations(regsResponse.data);
          loadData();
        } catch (error) {
          console.error('Error approving registration:', error);
        }
      }
    });
    setShowApproveConfirm(true);
  };

  const handleRejectRegistration = async (id) => {
    setConfirmTarget({
      message: 'Bạn có chắc muốn từ chối đơn đăng ký này?',
      info: 'Sinh viên sẽ nhận được thông báo từ chối qua email.',
      onConfirm: async () => {
        try {
          await API.put(`/registrations/${id}/reject`);
          const regsResponse = await API.get('/registrations');
          setRegistrations(regsResponse.data);
        } catch (error) {
          console.error('Error rejecting registration:', error);
        }
      }
    });
    setShowRejectConfirm(true);
  };

  const handleDeleteRegistration = async (id) => {
    const registration = registrations.find(r => r.id === id);
    if (!registration) return;
    
    setDeleteTarget({
      type: 'registration',
      data: registration,
      message: 'Bạn có chắc muốn xóa đơn đăng ký này?',
      warning: 'Hành động này không thể hoàn tác!',
      onConfirm: async () => {
        try {
          await API.delete(`/registrations/${id}`);
          showNotification('Đã xóa đơn đăng ký thành công!', 'success');
          const regsResponse = await API.get('/registrations');
          setRegistrations(regsResponse.data);
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        } catch (error) {
          console.error('Error deleting registration:', error);
          showNotification('Có lỗi xảy ra khi xóa đơn đăng ký!', 'error');
        }
      }
    });
    setShowDeleteConfirm(true);
  };

  const handleCreateRoom = async () => {
    if (!newRoom.building || !newRoom.roomNumber || !newRoom.capacity || !newRoom.price) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    try {
      await API.post('/rooms', newRoom);
      const roomsResponse = await API.get('/rooms');
      setRooms(roomsResponse.data);
      setShowRoomModal(false);
      setNewRoom({ building: '', roomNumber: '', capacity: 4, price: 1500000 });
      showNotification('Tạo phòng thành công!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Xác nhận xóa phòng này?\n\nLưu ý: Chỉ có thể xóa phòng trống (không có sinh viên).')) {
      try {
        await API.delete(`/rooms/${roomId}`);
        const roomsResponse = await API.get('/rooms');
        setRooms(roomsResponse.data);
        alert('Xóa phòng thành công!');
      } catch (error) {
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng!');
      }
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom.building || !editingRoom.roomNumber || !editingRoom.capacity || !editingRoom.price) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    try {
      await API.put(`/rooms/${editingRoom.id}`, {
        building: editingRoom.building,
        roomNumber: editingRoom.roomNumber,
        capacity: editingRoom.capacity,
        price: editingRoom.price
      });
      const roomsResponse = await API.get('/rooms');
      setRooms(roomsResponse.data);
      setShowEditRoomModal(false);
      setEditingRoom(null);
      showNotification('Cập nhật phòng thành công!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleAddStudentToRoom = async (studentCode) => {
    try {
      await API.post('/rooms/add-student', {
        roomId: selectedRoom.id,
        studentCode: studentCode
      });
      const roomsResponse = await API.get('/rooms');
      setRooms(roomsResponse.data);
      const studentsResponse = await API.get('/rooms/approved-students');
      setApprovedStudents(studentsResponse.data);
      setShowAddStudentModal(false);
      showNotification('Thêm sinh viên vào phòng thành công!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleRemoveStudentFromRoom = async (studentId, studentName) => {
    setDeleteTarget({
      message: `Bạn có chắc muốn xóa ${studentName} khỏi phòng?`,
      warning: 'Hợp đồng của sinh viên sẽ bị xóa và trạng thái phòng sẽ được cập nhật.',
      onConfirm: async () => {
        try {
          await API.post('/rooms/remove-student', {
            roomId: selectedRoom.id,
            studentId: studentId
          });
          const roomsResponse = await API.get('/rooms');
          setRooms(roomsResponse.data);
          const studentsResponse = await API.get('/rooms/approved-students');
          setApprovedStudents(studentsResponse.data);
          const studentsInRoomResponse = await API.get(`/rooms/${selectedRoom.id}/students`);
          setStudentsInRoom(studentsInRoomResponse.data);
          showNotification('Xóa sinh viên khỏi phòng thành công!', 'success');
        } catch (error) {
          showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
        }
      }
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = (id) => {
    const user = users.find(u => u.id === id);
    setDeleteTarget(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await API.delete(`/users/${deleteTarget.id}`);
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      showNotification('Đã xóa người dùng thành công!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      showNotification('Có lỗi xảy ra khi xóa người dùng!', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    // Validation
    if (!editingUser.username || !editingUser.email) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!editingUser.id && (!editingUser.password || editingUser.password.length < 3)) {
      alert('Mật khẩu phải có ít nhất 3 ký tự!');
      return;
    }

    try {
      if (editingUser.id) {
        // Cập nhật người dùng
        await API.put(`/users/${editingUser.id}`, {
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status
        });
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        showNotification('Cập nhật người dùng thành công!', 'success');
      } else {
        // Thêm người dùng mới
        const response = await API.post('/auth/register', {
          username: editingUser.username,
          password: editingUser.password,
          role: editingUser.role || 'SinhVien',
          email: editingUser.email
        });
        
        // Thêm vào danh sách hiển thị
        const newUser = {
          id: response.data.id,
          username: editingUser.username,
          email: editingUser.email,
          role: editingUser.role || 'SinhVien',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
        
        // Hiển thị modal thông báo thành công đẹp
        setSuccessData({
          username: editingUser.username,
          password: editingUser.password,
          email: editingUser.email,
          role: editingUser.role || 'SinhVien'
        });
        setShowSuccessModal(true);
      }
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleChangePassword = (user) => {
    setPasswordData({ userId: user.id, username: user.username, newPassword: '' });
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!passwordData.newPassword || passwordData.newPassword.length < 3) {
      alert('Mật khẩu phải có ít nhất 3 ký tự!');
      return;
    }

    try {
      // Gọi API để đổi mật khẩu
      await API.put(`/users/${passwordData.userId}/password`, { password: passwordData.newPassword });
      
      alert(`Đã đổi mật khẩu cho người dùng "${passwordData.username}" thành công!\nMật khẩu mới: ${passwordData.newPassword}`);
      setShowPasswordModal(false);
      setPasswordData({ userId: null, username: '', newPassword: '' });
    } catch (error) {
      alert('Có lỗi xảy ra khi đổi mật khẩu!');
    }
  };

  // Payment handlers
  const handleCreatePayment = async () => {
    if (!newPayment.studentId) {
      showNotification('Vui lòng chọn sinh viên!', 'error');
      return;
    }

    try {
      await API.post('/payments', newPayment);
      showNotification('Tạo hóa đơn thành công!', 'success');
      setShowPaymentModal(false);
      setNewPayment({
        studentId: '',
        roomId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        roomFee: 0,
        electricityFee: 0,
        waterFee: 0,
        electricityUsage: 0,
        waterUsage: 0,
        note: ''
      });
      loadData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleUpdatePayment = async () => {
    try {
      await API.put(`/payments/${editingPayment.id}`, {
        roomFee: editingPayment.roomFee,
        electricityFee: editingPayment.electricityFee,
        waterFee: editingPayment.waterFee,
        electricityUsage: editingPayment.electricityUsage,
        waterUsage: editingPayment.waterUsage,
        note: editingPayment.note
      });
      showNotification('Cập nhật hóa đơn thành công!', 'success');
      setShowEditPaymentModal(false);
      setEditingPayment(null);
      loadData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleDeletePayment = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    setDeletingPayment(payment);
    setShowDeletePaymentConfirm(true);
  };

  const confirmDeletePayment = async () => {
    try {
      await API.delete(`/payments/${deletingPayment.id}`);
      showNotification('Xóa hóa đơn thành công!', 'success');
      setShowDeletePaymentConfirm(false);
      setDeletingPayment(null);
      loadData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const handleStudentChange = (studentId) => {
    const student = studentsWithRooms.find(s => s.studentId === parseInt(studentId));
    if (student) {
      setNewPayment({
        ...newPayment,
        studentId: student.studentId,
        roomId: student.roomId,
        roomFee: student.roomPrice
      });
    }
  };

  const calculateElectricityFee = (usage) => {
    return usage * 3000; // 3,000 VNĐ/kWh
  };

  const calculateWaterFee = (usage) => {
    return usage * 15000; // 15,000 VNĐ/m³
  };

  return (
    <div className="admin-dashboard">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/images/logo.png" alt="Logo" className="logo-image" />
            <span>KTX Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Tổng quan</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <i className="bi bi-file-earmark-text"></i>
            <span>Đơn đăng ký</span>
            {stats.pendingRegistrations > 0 && (
              <span className="badge">{stats.pendingRegistrations}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people"></i>
            <span>Người dùng</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <i className="bi bi-door-open"></i>
            <span>Phòng ở</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <i className="bi bi-credit-card"></i>
            <span>Thanh toán</span>
          </button>
          {(user?.VaiTro === 'QuanLy' || user?.VaiTro === 'Admin') && (
            <button 
              className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <i className="bi bi-headset"></i>
              <span>Yêu cầu hỗ trợ</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'overview' && 'Tổng quan'}
            {activeTab === 'registrations' && 'Quản lý đơn đăng ký'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'rooms' && 'Quản lý phòng ở'}
            {activeTab === 'payments' && 'Quản lý thanh toán'}
            {activeTab === 'support' && 'Yêu cầu hỗ trợ'}
          </h1>
          <div className="header-actions">
            <div className="user-info">
              <i className="bi bi-person-circle"></i>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card stat-blue">
                  <div className="stat-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalStudents}</h3>
                    <p>Tổng sinh viên</p>
                  </div>
                </div>
                <div className="stat-card stat-green">
                  <div className="stat-icon">
                    <i className="bi bi-door-open"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalRooms}</h3>
                    <p>Tổng phòng</p>
                  </div>
                </div>
                <div className="stat-card stat-orange">
                  <div className="stat-icon">
                    <i className="bi bi-file-earmark-check"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.approvedRegistrations}</h3>
                    <p>Đơn đã duyệt</p>
                  </div>
                </div>
                <div className="stat-card stat-red">
                  <div className="stat-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingRegistrations}</h3>
                    <p>Đơn chờ duyệt</p>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h3><i className="bi bi-bar-chart-fill"></i> Thống kê đăng ký theo tháng (12 tháng gần nhất)</h3>
                  <div style={{ height: '350px', padding: '1rem 0' }}>
                    {registrationChartData.length > 0 ? (
                      <RegistrationChart data={registrationChartData} />
                    ) : (
                      <div className="chart-placeholder">
                        <i className="bi bi-bar-chart"></i>
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === 'registrations' && (
            <div className="registrations-section">
              {/* Registration Stats */}
              <div className="registration-stats">
                <div className="reg-stat-card stat-approved">
                  <div className="reg-stat-icon">
                    <i className="bi bi-file-earmark-check"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{registrations.filter(r => r.status === 'approved').length}</h3>
                    <p>Đơn đã duyệt</p>
                  </div>
                </div>
                <div className="reg-stat-card stat-pending">
                  <div className="reg-stat-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{registrations.filter(r => r.status === 'pending').length}</h3>
                    <p>Đơn chờ duyệt</p>
                  </div>
                </div>
                <div className="reg-stat-card stat-rejected">
                  <div className="reg-stat-icon">
                    <i className="bi bi-file-earmark-x"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{registrations.filter(r => r.status === 'rejected').length}</h3>
                    <p>Đơn từ chối</p>
                  </div>
                </div>
              </div>

              <div className="section-header">
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${registrationFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setRegistrationFilter('all')}
                  >
                    Tất cả
                  </button>
                  <button 
                    className={`filter-tab ${registrationFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setRegistrationFilter('pending')}
                  >
                    Chờ duyệt
                  </button>
                  <button 
                    className={`filter-tab ${registrationFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setRegistrationFilter('approved')}
                  >
                    Đã duyệt
                  </button>
                  <button 
                    className={`filter-tab ${registrationFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setRegistrationFilter('rejected')}
                  >
                    Từ chối
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã SV</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map(reg => (
                      <tr key={reg.id}>
                        <td>{reg.studentId}</td>
                        <td>{reg.fullName}</td>
                        <td>{reg.email}</td>
                        <td>{reg.phone}</td>
                        <td>{reg.date}</td>
                        <td>
                          <span className={`status-badge status-${reg.status}`}>
                            {reg.status === 'pending' && 'Chờ duyệt'}
                            {reg.status === 'approved' && 'Đã duyệt'}
                            {reg.status === 'rejected' && 'Từ chối'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {reg.status === 'pending' && (
                              <>
                                <button 
                                  className="btn-action btn-approve"
                                  onClick={() => handleApproveRegistration(reg.id)}
                                  title="Duyệt"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button 
                                  className="btn-action btn-reject"
                                  onClick={() => handleRejectRegistration(reg.id)}
                                  title="Từ chối"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            )}
                            <button 
                              className="btn-action btn-view" 
                              title="Xem chi tiết"
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setShowDetailModal(true);
                              }}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteRegistration(reg.id)}
                              title="Xóa đơn"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <button 
                  className="btn-add"
                  onClick={() => {
                    setEditingUser({ username: '', email: '', role: 'SinhVien', status: 'active' });
                    setShowUserModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg"></i> Thêm người dùng
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên đăng nhập</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status}`}>
                            {user.status === 'active' ? 'Hoạt động' : 'Khóa'}
                          </span>
                        </td>
                        <td>{user.createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-edit"
                              onClick={() => handleEditUser(user)}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn-action btn-password"
                              onClick={() => handleChangePassword(user)}
                              title="Đổi mật khẩu"
                            >
                              <i className="bi bi-key"></i>
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Xóa"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="rooms-section">
              <div className="section-header">
                <button 
                  className="btn-add"
                  onClick={() => setShowRoomModal(true)}
                >
                  <i className="bi bi-plus-lg"></i> Tạo phòng mới
                </button>
              </div>

              {rooms.length === 0 ? (
                <div style={{ 
                  background: 'white', 
                  padding: '3rem', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <i className="bi bi-door-closed" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Chưa có phòng nào</p>
                  <p style={{ fontSize: '0.9rem' }}>Nhấn "Tạo phòng mới" để thêm phòng</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tòa</th>
                        <th>Số phòng</th>
                        <th>Loại phòng</th>
                        <th>Sức chứa</th>
                        <th>Số người hiện tại</th>
                        <th>Giá thuê</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.id}>
                          <td><strong>{room.building}</strong></td>
                          <td><strong>{room.roomNumber}</strong></td>
                          <td>{room.roomType}</td>
                          <td>{room.capacity} người</td>
                          <td>
                            <span style={{ 
                              color: room.currentOccupancy >= room.capacity ? '#ef4444' : '#10b981',
                              fontWeight: '600'
                            }}>
                              {room.currentOccupancy}/{room.capacity}
                            </span>
                          </td>
                          <td>{room.price?.toLocaleString('vi-VN')} đ</td>
                          <td>
                            <span className={`status-badge ${
                              room.status === 'Trống' ? 'status-active' : 
                              room.status === 'Đầy' ? 'status-rejected' : 
                              'status-pending'
                            }`}>
                              {room.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {room.currentOccupancy < room.capacity && (
                                <button 
                                  className="btn-action btn-approve"
                                  onClick={async () => {
                                    setSelectedRoom(room);
                                    // Load sinh viên trong phòng
                                    try {
                                      const studentsInRoomResponse = await API.get(`/rooms/${room.id}/students`);
                                      setStudentsInRoom(studentsInRoomResponse.data);
                                    } catch (error) {
                                      console.error('Error loading students in room:', error);
                                      setStudentsInRoom([]);
                                    }
                                    // Load sinh viên đã duyệt (chưa có phòng)
                                    try {
                                      const approvedResponse = await API.get('/rooms/approved-students');
                                      setApprovedStudents(approvedResponse.data);
                                    } catch (error) {
                                      console.error('Error loading approved students:', error);
                                      setApprovedStudents([]);
                                    }
                                    setShowAddStudentModal(true);
                                  }}
                                  title="Thêm sinh viên"
                                >
                                  <i className="bi bi-person-plus"></i>
                                </button>
                              )}
                              <button 
                                className="btn-action btn-edit"
                                onClick={() => {
                                  setEditingRoom({
                                    id: room.id,
                                    building: room.building,
                                    roomNumber: room.roomNumber,
                                    capacity: room.capacity,
                                    price: parseFloat(room.price)
                                  });
                                  setShowEditRoomModal(true);
                                }}
                                title="Chỉnh sửa"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn-action btn-view"
                                title="Xem chi tiết"
                                onClick={async () => {
                                  setSelectedRoom(room);
                                  // Load sinh viên trong phòng
                                  try {
                                    const response = await API.get(`/rooms/${room.id}/students`);
                                    setStudentsInRoom(response.data);
                                  } catch (error) {
                                    console.error('Error loading students:', error);
                                    setStudentsInRoom([]);
                                  }
                                  setShowRoomDetailModal(true);
                                }}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn-action btn-delete"
                                onClick={() => handleDeleteRoom(room.id)}
                                title="Xóa phòng"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Support Requests Tab */}
          {activeTab === 'support' && (user?.VaiTro === 'QuanLy' || user?.VaiTro === 'Admin') && (
            <div className="support-requests-section">
              {/* Support Stats */}
              <div className="registration-stats">
                <div className="reg-stat-card stat-pending">
                  <div className="reg-stat-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{supportRequests.filter(r => r.TrangThai === 'Chờ xử lý').length}</h3>
                    <p>Chờ xử lý</p>
                  </div>
                </div>
                <div className="reg-stat-card stat-processing">
                  <div className="reg-stat-icon">
                    <i className="bi bi-arrow-repeat"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{supportRequests.filter(r => r.TrangThai === 'Đang xử lý').length}</h3>
                    <p>Đang xử lý</p>
                  </div>
                </div>
                <div className="reg-stat-card stat-approved">
                  <div className="reg-stat-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="reg-stat-info">
                    <h3>{supportRequests.filter(r => r.TrangThai === 'Đã xử lý').length}</h3>
                    <p>Đã xử lý</p>
                  </div>
                </div>
              </div>

              {supportRequests.length === 0 ? (
                <div style={{ 
                  background: 'white', 
                  padding: '3rem', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <i className="bi bi-headset" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Chưa có yêu cầu hỗ trợ nào</p>
                  <p style={{ fontSize: '0.9rem' }}>Các yêu cầu hỗ trợ từ sinh viên sẽ hiển thị ở đây</p>
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
                            <div style={{ 
                              maxWidth: '300px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {request.TinNhan}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: '150px' }}>
                              <CustomSelect
                                value={request.TrangThai}
                                onChange={async (value) => {
                                  try {
                                    await API.put(`/support-requests/${request.MaYeuCau}/status`, {
                                      status: value
                                    });
                                    loadData();
                                  } catch (error) {
                                    console.error('Error updating status:', error);
                                    showNotification('Không thể cập nhật trạng thái', 'error');
                                  }
                                }}
                                options={[
                                  { value: 'Chờ xử lý', label: 'Chờ xử lý' },
                                  { value: 'Đang xử lý', label: 'Đang xử lý' },
                                  { value: 'Đã xử lý', label: 'Đã xử lý' }
                                ]}
                                className={
                                  request.TrangThai === 'Chờ xử lý' ? 'status-pending' : 
                                  request.TrangThai === 'Đang xử lý' ? 'status-processing' : 
                                  'status-completed'
                                }
                              />
                            </div>
                          </td>
                          <td>{new Date(request.NgayTao).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-action btn-reject"
                                onClick={() => {
                                  setDeleteSupportTarget({
                                    id: request.MaYeuCau,
                                    name: request.HoTen,
                                    email: request.Email
                                  });
                                  setShowDeleteSupportConfirm(true);
                                }}
                                title="Xóa"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              paymentStats={paymentStats}
              studentsWithRooms={studentsWithRooms}
              newPayment={newPayment}
              setNewPayment={setNewPayment}
              editingPayment={editingPayment}
              setEditingPayment={setEditingPayment}
              showPaymentModal={showPaymentModal}
              setShowPaymentModal={setShowPaymentModal}
              showEditPaymentModal={showEditPaymentModal}
              setShowEditPaymentModal={setShowEditPaymentModal}
              handleCreatePayment={handleCreatePayment}
              handleUpdatePayment={handleUpdatePayment}
              handleDeletePayment={handleDeletePayment}
              handleStudentChange={handleStudentChange}
              calculateElectricityFee={calculateElectricityFee}
              calculateWaterFee={calculateWaterFee}
            />
          )}
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser?.id ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
              <button className="btn-close" onClick={() => setShowUserModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên đăng nhập <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  disabled={editingUser?.id}
                />
                {editingUser?.id && <small className="form-hint">Không thể thay đổi tên đăng nhập</small>}
              </div>
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              {!editingUser?.id && (
                <div className="form-group">
                  <label>Mật khẩu <span className="required">*</span></label>
                  <div className="password-input-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập mật khẩu"
                      value={editingUser?.password || ''}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    />
                    <button 
                      className="btn-generate"
                      type="button"
                      onClick={() => {
                        const randomPassword = Math.random().toString(36).slice(-8);
                        setEditingUser({...editingUser, password: randomPassword});
                      }}
                      title="Tạo mật khẩu ngẫu nhiên"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                  <small className="form-hint">Mật khẩu phải có ít nhất 3 ký tự</small>
                </div>
              )}
              <div className="form-group">
                <label>Vai trò</label>
                <CustomSelect
                  value={editingUser?.role || 'SinhVien'}
                  onChange={(value) => setEditingUser({...editingUser, role: value})}
                  options={[
                    { value: 'SinhVien', label: 'Sinh viên' },
                    { value: 'Admin', label: 'Admin' },
                    { value: 'QuanLy', label: 'Quản lý' }
                  ]}
                />
              </div>
              {editingUser?.id && (
                <div className="form-group">
                  <label>Trạng thái</label>
                  <CustomSelect
                    value={editingUser?.status || 'active'}
                    onChange={(value) => setEditingUser({...editingUser, status: value})}
                    options={[
                      { value: 'active', label: 'Hoạt động' },
                      { value: 'inactive', label: 'Khóa' }
                    ]}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowUserModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSaveUser}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đổi mật khẩu người dùng</h3>
              <button className="btn-close" onClick={() => setShowPasswordModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="password-info">
                <i className="bi bi-person-circle"></i>
                <div>
                  <p className="password-username">{passwordData.username}</p>
                  <p className="password-hint">Nhập mật khẩu mới cho người dùng này</p>
                </div>
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type="text"
                    placeholder="Nhập mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    autoFocus
                  />
                  <button 
                    className="btn-generate"
                    onClick={() => {
                      const randomPassword = Math.random().toString(36).slice(-8);
                      setPasswordData({...passwordData, newPassword: randomPassword});
                    }}
                    title="Tạo mật khẩu ngẫu nhiên"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
                <small className="form-hint">Mật khẩu phải có ít nhất 3 ký tự</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSavePassword}>
                <i className="bi bi-check-lg"></i> Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn đăng ký</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4><i className="bi bi-person-badge"></i> Thông tin cá nhân</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Họ và tên:</label>
                    <span>{selectedRegistration.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Mã sinh viên:</label>
                    <span>{selectedRegistration.studentId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedRegistration.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedRegistration.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giới tính:</label>
                    <span>{selectedRegistration.gender || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày sinh:</label>
                    <span>
                      {selectedRegistration.birthDate 
                        ? new Date(selectedRegistration.birthDate).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Địa chỉ:</label>
                    <span>{selectedRegistration.address || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày đăng ký:</label>
                    <span>{selectedRegistration.date}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng thái:</label>
                    <span className={`status-badge status-${selectedRegistration.status}`}>
                      {selectedRegistration.status === 'pending' && 'Chờ duyệt'}
                      {selectedRegistration.status === 'approved' && 'Đã duyệt'}
                      {selectedRegistration.status === 'rejected' && 'Từ chối'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><i className="bi bi-images"></i> Giấy tờ đính kèm</h4>
                <div className="images-grid">
                  <div className="image-item">
                    <label>Ảnh CMND/CCCD (2 mặt)</label>
                    <div className="image-preview">
                      {selectedRegistration.idCardImage ? (
                        <img src={`http://localhost:5000${selectedRegistration.idCardImage}`} alt="CMND/CCCD" />
                      ) : (
                        <div className="no-image">
                          <i className="bi bi-image"></i>
                          <p>Chưa có ảnh</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="image-item">
                    <label>Ảnh Thẻ Sinh Viên</label>
                    <div className="image-preview">
                      {selectedRegistration.studentCardImage ? (
                        <img src={`http://localhost:5000${selectedRegistration.studentCardImage}`} alt="Thẻ sinh viên" />
                      ) : (
                        <div className="no-image">
                          <i className="bi bi-image"></i>
                          <p>Chưa có ảnh</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedRegistration.status === 'pending' && (
                <>
                  <button 
                    className="btn-save" 
                    style={{ background: '#10b981' }}
                    onClick={() => {
                      handleApproveRegistration(selectedRegistration.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <i className="bi bi-check-lg"></i> Duyệt đơn
                  </button>
                  <button 
                    className="btn-cancel" 
                    style={{ background: '#ef4444', color: 'white' }}
                    onClick={() => {
                      handleRejectRegistration(selectedRegistration.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <i className="bi bi-x-lg"></i> Từ chối
                  </button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo phòng mới</h3>
              <button className="btn-close" onClick={() => setShowRoomModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tòa <span className="required">*</span></label>
                <CustomSelect
                  value={newRoom.building || ''}
                  onChange={(value) => setNewRoom({...newRoom, building: value})}
                  options={[
                    { value: '', label: 'Chọn tòa' },
                    { value: 'A', label: 'Tòa A' },
                    { value: 'B', label: 'Tòa B' },
                    { value: 'C', label: 'Tòa C' },
                    { value: 'D', label: 'Tòa D' }
                  ]}
                  placeholder="Chọn tòa"
                />
              </div>
              <div className="form-group">
                <label>Số phòng <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: 101, 205"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sức chứa <span className="required">*</span></label>
                <CustomSelect
                  value={newRoom.capacity}
                  onChange={(value) => setNewRoom({...newRoom, capacity: parseInt(value)})}
                  options={[
                    { value: 2, label: '2 người' },
                    { value: 4, label: '4 người' },
                    { value: 6, label: '6 người' },
                    { value: 8, label: '8 người' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label>Giá thuê (VNĐ/tháng) <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="Ví dụ: 1500000"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({...newRoom, price: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRoomModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleCreateRoom}>
                <i className="bi bi-plus-lg"></i> Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student to Room Modal */}
      {showAddStudentModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowAddStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm sinh viên vào phòng {selectedRoom.roomNumber}</h3>
              <button className="btn-close" onClick={() => setShowAddStudentModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="room-info-box">
                <div className="room-info-item">
                  <i className="bi bi-door-open"></i>
                  <div>
                    <small>Phòng</small>
                    <strong>{selectedRoom.roomNumber}</strong>
                  </div>
                </div>
                <div className="room-info-item">
                  <i className="bi bi-people"></i>
                  <div>
                    <small>Sức chứa</small>
                    <strong>{selectedRoom.currentOccupancy}/{selectedRoom.capacity}</strong>
                  </div>
                </div>
                <div className="room-info-item">
                  <i className="bi bi-cash"></i>
                  <div>
                    <small>Giá thuê</small>
                    <strong>{selectedRoom.price?.toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>

              {/* Sinh viên đang ở trong phòng */}
              {studentsInRoom.length > 0 && (
                <div className="form-group">
                  <label>
                    <i className="bi bi-people-fill"></i> Sinh viên đang ở trong phòng ({studentsInRoom.length})
                  </label>
                  <div className="current-students-list">
                    {studentsInRoom.map((student, index) => (
                      <div key={index} className="current-student-item">
                        <div className="student-info">
                          <i className="bi bi-person-check-fill"></i>
                          <div>
                            <strong>{student.fullName}</strong>
                            <small>Email: {student.email}</small>
                          </div>
                        </div>
                        <div className="student-actions">
                          <span className="student-badge">Đang ở</span>
                          <button 
                            className="btn-remove-student"
                            onClick={() => handleRemoveStudentFromRoom(student.studentId, student.fullName)}
                            title="Xóa khỏi phòng"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Chọn sinh viên đã được duyệt</label>
                {approvedStudents.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>Không có sinh viên nào đã được duyệt</p>
                  </div>
                ) : (
                  <div className="students-list">
                    {approvedStudents.map(student => (
                      <div key={student.studentCode} className="student-item">
                        <div className="student-info">
                          <i className="bi bi-person-circle"></i>
                          <div>
                            <strong>{student.fullName}</strong>
                            <small>Mã SV: {student.studentCode}</small>
                          </div>
                        </div>
                        <button 
                          className="btn-add-student"
                          onClick={() => handleAddStudentToRoom(student.studentCode)}
                        >
                          <i className="bi bi-plus-lg"></i> Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddStudentModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {showRoomDetailModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowRoomDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết phòng {selectedRoom.roomNumber}</h3>
              <button className="btn-close" onClick={() => setShowRoomDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Thông tin phòng */}
              <div className="room-info-box">
                <div className="room-info-item">
                  <i className="bi bi-door-open"></i>
                  <div>
                    <small>Số phòng</small>
                    <strong>{selectedRoom.roomNumber}</strong>
                  </div>
                </div>
                <div className="room-info-item">
                  <i className="bi bi-people"></i>
                  <div>
                    <small>Sức chứa</small>
                    <strong>{selectedRoom.currentOccupancy}/{selectedRoom.capacity}</strong>
                  </div>
                </div>
                <div className="room-info-item">
                  <i className="bi bi-cash"></i>
                  <div>
                    <small>Giá thuê</small>
                    <strong>{selectedRoom.price?.toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
                <div className="room-info-item">
                  <i className="bi bi-info-circle"></i>
                  <div>
                    <small>Trạng thái</small>
                    <strong className={`status-badge ${
                      selectedRoom.status === 'Trống' ? 'status-active' : 
                      selectedRoom.status === 'Đầy' ? 'status-rejected' : 
                      'status-pending'
                    }`}>
                      {selectedRoom.status}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Danh sách sinh viên */}
              <div className="detail-section">
                <h4>
                  <i className="bi bi-people-fill"></i> 
                  Sinh viên trong phòng ({studentsInRoom.length})
                </h4>
                {studentsInRoom.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>Phòng chưa có sinh viên nào</p>
                  </div>
                ) : (
                  <div className="room-students-list">
                    {studentsInRoom.map((student, index) => (
                      <div key={index} className="room-student-item">
                        <div className="student-avatar">
                          <i className="bi bi-person-circle"></i>
                        </div>
                        <div className="student-details">
                          <div className="student-name">{student.fullName}</div>
                          <div className="student-meta">
                            <span><i className="bi bi-envelope"></i> {student.email || 'Chưa có email'}</span>
                            <span><i className="bi bi-telephone"></i> {student.phone || 'Chưa có SĐT'}</span>
                          </div>
                          <div className="student-contract">
                            <small>
                              <i className="bi bi-calendar"></i> 
                              {new Date(student.startDate).toLocaleDateString('vi-VN')} - 
                              {new Date(student.endDate).toLocaleDateString('vi-VN')}
                            </small>
                          </div>
                        </div>
                        <button 
                          className="btn-remove-from-room"
                          onClick={() => {
                            setDeleteTarget({
                              message: `Bạn có chắc muốn xóa ${student.fullName} khỏi phòng?`,
                              warning: 'Hợp đồng của sinh viên sẽ bị xóa và trạng thái phòng sẽ được cập nhật.',
                              onConfirm: async () => {
                                try {
                                  await API.post('/rooms/remove-student', {
                                    roomId: selectedRoom.id,
                                    studentId: student.studentId
                                  });
                                  const roomsResponse = await API.get('/rooms');
                                  setRooms(roomsResponse.data);
                                  const studentsResponse = await API.get(`/rooms/${selectedRoom.id}/students`);
                                  setStudentsInRoom(studentsResponse.data);
                                  const updatedRoom = roomsResponse.data.find(r => r.id === selectedRoom.id);
                                  setSelectedRoom(updatedRoom);
                                  showNotification('Xóa sinh viên khỏi phòng thành công!', 'success');
                                } catch (error) {
                                  showNotification(error.response?.data?.message || 'Có lỗi xảy ra!', 'error');
                                }
                              }
                            });
                            setShowDeleteConfirm(true);
                          }}
                          title="Xóa khỏi phòng"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRoomDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditRoomModal && editingRoom && (
        <div className="modal-overlay" onClick={() => setShowEditRoomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa phòng</h3>
              <button className="btn-close" onClick={() => setShowEditRoomModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tòa <span className="required">*</span></label>
                <CustomSelect
                  value={editingRoom.building || ''}
                  onChange={(value) => setEditingRoom({...editingRoom, building: value})}
                  options={[
                    { value: '', label: 'Chọn tòa' },
                    { value: 'A', label: 'Tòa A' },
                    { value: 'B', label: 'Tòa B' },
                    { value: 'C', label: 'Tòa C' },
                    { value: 'D', label: 'Tòa D' }
                  ]}
                  placeholder="Chọn tòa"
                />
              </div>
              <div className="form-group">
                <label>Số phòng <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Ví dụ: 101, 205"
                  value={editingRoom.roomNumber}
                  onChange={(e) => setEditingRoom({...editingRoom, roomNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sức chứa <span className="required">*</span></label>
                <CustomSelect
                  value={editingRoom.capacity}
                  onChange={(value) => setEditingRoom({...editingRoom, capacity: parseInt(value)})}
                  options={[
                    { value: 2, label: '2 người' },
                    { value: 4, label: '4 người' },
                    { value: 6, label: '6 người' },
                    { value: 8, label: '8 người' }
                  ]}
                />
                <small className="form-hint">
                  Lưu ý: Không thể giảm sức chứa xuống thấp hơn số sinh viên hiện tại
                </small>
              </div>
              <div className="form-group">
                <label>Giá thuê (VNĐ/tháng) <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="Ví dụ: 1500000"
                  value={editingRoom.price}
                  onChange={(e) => setEditingRoom({...editingRoom, price: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditRoomModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleUpdateRoom}>
                <i className="bi bi-check-lg"></i> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">
              <i className="bi bi-trash"></i>
            </div>
            <h3>
              {deleteTarget.type === 'registration' ? 'Xác nhận xóa đơn đăng ký' : 'Xác nhận xóa người dùng'}
            </h3>
            <p>{deleteTarget.message || 'Bạn có chắc muốn xóa mục này không?'}</p>
            
            <div className="warning-box">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>Hành động này không thể hoàn tác!</span>
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              {deleteTarget.type === 'registration' && deleteTarget.data ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Họ và tên:</span>
                    <strong>{deleteTarget.data.fullName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Mã sinh viên:</span>
                    <strong>{deleteTarget.data.studentCode}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong>{deleteTarget.data.email}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Tên đăng nhập:</span>
                    <strong>{deleteTarget.TenDangNhap || deleteTarget.username}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong>{deleteTarget.Email || deleteTarget.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Vai trò:</span>
                    <span className={`role-badge role-${(deleteTarget.VaiTro || deleteTarget.role || '').toLowerCase()}`}>
                      {deleteTarget.VaiTro || deleteTarget.role}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel-delete" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={() => {
                  if (deleteTarget.onConfirm) {
                    deleteTarget.onConfirm();
                  } else if (deleteTarget.type !== 'registration') {
                    confirmDeleteUser();
                  }
                }}
              >
                <i className="bi bi-trash"></i> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="modal-overlay" onClick={() => setShowApproveConfirm(false)}>
          <div className="approve-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="approve-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Xác nhận duyệt</h3>
            <p>{confirmTarget?.message}</p>
            {confirmTarget?.info && (
              <div className="info-box">
                <i className="bi bi-info-circle-fill"></i>
                <span>{confirmTarget.info}</span>
              </div>
            )}
            <div className="modal-actions">
              <button 
                className="btn-cancel-approve" 
                onClick={() => setShowApproveConfirm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm-approve" 
                onClick={() => {
                  confirmTarget?.onConfirm();
                  setShowApproveConfirm(false);
                }}
              >
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="modal-overlay" onClick={() => setShowRejectConfirm(false)}>
          <div className="reject-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reject-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <h3>Xác nhận từ chối</h3>
            <p>{confirmTarget?.message}</p>
            {confirmTarget?.info && (
              <div className="info-box">
                <i className="bi bi-info-circle-fill"></i>
                <span>{confirmTarget.info}</span>
              </div>
            )}
            <div className="modal-actions">
              <button 
                className="btn-cancel-reject" 
                onClick={() => setShowRejectConfirm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm-reject" 
                onClick={() => {
                  confirmTarget?.onConfirm();
                  setShowRejectConfirm(false);
                }}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Support Request Confirmation Modal */}
      {showDeleteSupportConfirm && deleteSupportTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteSupportConfirm(false)}>
          <div className="delete-support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-support-icon">
              <i className="bi bi-trash-fill"></i>
            </div>
            <h3>Xóa yêu cầu hỗ trợ?</h3>
            <p>Bạn có chắc muốn xóa yêu cầu hỗ trợ này không?</p>
            
            <div className="support-request-info">
              <div className="info-row">
                <i className="bi bi-person-fill"></i>
                <span><strong>Người gửi:</strong> {deleteSupportTarget.name}</span>
              </div>
              <div className="info-row">
                <i className="bi bi-envelope-fill"></i>
                <span><strong>Email:</strong> {deleteSupportTarget.email}</span>
              </div>
            </div>

            <div className="warning-note">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>Hành động này không thể hoàn tác!</span>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel-delete-support" 
                onClick={() => setShowDeleteSupportConfirm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm-delete-support" 
                onClick={async () => {
                  try {
                    await API.delete(`/support-requests/${deleteSupportTarget.id}`);
                    loadData();
                    showNotification('Đã xóa yêu cầu hỗ trợ thành công!', 'success');
                  } catch (error) {
                    console.error('Error deleting request:', error);
                    showNotification('Không thể xóa yêu cầu!', 'error');
                  }
                  setShowDeleteSupportConfirm(false);
                }}
              >
                <i className="bi bi-trash-fill"></i> Xóa yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - User Created */}
      {showSuccessModal && successData && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-header">
              <div className="success-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h3>Tạo người dùng thành công!</h3>
              <p>Thông tin đăng nhập đã được tạo. Vui lòng lưu lại thông tin này.</p>
            </div>

            <div className="success-modal-body">
              <div className="success-info-box">
                <div className="success-info-item">
                  <label><i className="bi bi-person-badge"></i> Tên đăng nhập</label>
                  <div className="info-value">
                    <span>{successData.username}</span>
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(successData.username);
                        showNotification('Đã sao chép tên đăng nhập!', 'success');
                      }}
                      title="Sao chép"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>

                <div className="success-info-item">
                  <label><i className="bi bi-key-fill"></i> Mật khẩu</label>
                  <div className="info-value">
                    <span className="password-text">{successData.password}</span>
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(successData.password);
                        showNotification('Đã sao chép mật khẩu!', 'success');
                      }}
                      title="Sao chép"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>

                <div className="success-info-item">
                  <label><i className="bi bi-envelope-fill"></i> Email</label>
                  <div className="info-value">
                    <span>{successData.email}</span>
                  </div>
                </div>

                <div className="success-info-item">
                  <label><i className="bi bi-shield-fill"></i> Vai trò</label>
                  <div className="info-value">
                    <span className={`role-badge role-${successData.role.toLowerCase()}`}>
                      {successData.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="success-warning">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>Lưu ý: Hãy lưu lại mật khẩu này vì bạn sẽ không thể xem lại sau này!</span>
              </div>
            </div>

            <div className="success-modal-footer">
              <button 
                className="btn-success-close"
                onClick={() => setShowSuccessModal(false)}
              >
                <i className="bi bi-check-lg"></i> Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {showDeletePaymentConfirm && deletingPayment && (
        <div className="modal-overlay" onClick={() => setShowDeletePaymentConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">
              <i className="bi bi-trash"></i>
            </div>
            <h3>Xác nhận xóa hóa đơn</h3>
            <p>Bạn có chắc muốn xóa hóa đơn này không?</p>
            
            <div className="warning-box">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>Hành động này không thể hoàn tác!</span>
            </div>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Sinh viên:</span>
                <strong>{deletingPayment.studentName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Phòng:</span>
                <strong>{deletingPayment.roomNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Tháng/Năm:</span>
                <strong>{deletingPayment.month}/{deletingPayment.year}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '0.75rem',
                marginTop: '0.5rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Tổng tiền:</span>
                <strong style={{ fontSize: '1.2rem', color: '#ef4444' }}>
                  {parseFloat(deletingPayment.totalAmount).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel-delete" 
                onClick={() => setShowDeletePaymentConfirm(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={confirmDeletePayment}
              >
                <i className="bi bi-trash"></i> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
