import React from 'react';

export default function PaymentsTab({
  payments,
  paymentStats,
  studentsWithRooms,
  newPayment,
  setNewPayment,
  editingPayment,
  setEditingPayment,
  showPaymentModal,
  setShowPaymentModal,
  showEditPaymentModal,
  setShowEditPaymentModal,
  handleCreatePayment,
  handleUpdatePayment,
  handleDeletePayment,
  handleStudentChange,
  calculateElectricityFee,
  calculateWaterFee
}) {
  
  const getTotalAmount = (payment) => {
    return parseFloat(payment.roomFee || 0) + parseFloat(payment.electricityFee || 0) + parseFloat(payment.waterFee || 0);
  };

  return (
    <div className="payments-section">
      {/* Payment Stats */}
      <div className="registration-stats">
        <div className="reg-stat-card stat-pending">
          <div className="reg-stat-icon">
            <i className="bi bi-exclamation-circle"></i>
          </div>
          <div className="reg-stat-info">
            <h3>{paymentStats.unpaidCount || 0}</h3>
            <p>Chưa thanh toán</p>
            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {(paymentStats.unpaidAmount || 0).toLocaleString('vi-VN')} đ
            </small>
          </div>
        </div>
        <div className="reg-stat-card stat-approved">
          <div className="reg-stat-icon">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="reg-stat-info">
            <h3>{paymentStats.paidCount || 0}</h3>
            <p>Đã thanh toán</p>
            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {(paymentStats.paidAmount || 0).toLocaleString('vi-VN')} đ
            </small>
          </div>
        </div>
        <div className="reg-stat-card stat-processing">
          <div className="reg-stat-icon">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="reg-stat-info">
            <h3>{paymentStats.totalInvoices || 0}</h3>
            <p>Tổng hóa đơn</p>
            <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {((paymentStats.unpaidAmount || 0) + (paymentStats.paidAmount || 0)).toLocaleString('vi-VN')} đ
            </small>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="section-header">
        <button 
          className="btn-add"
          onClick={() => setShowPaymentModal(true)}
        >
          <i className="bi bi-plus-lg"></i> Tạo hóa đơn mới
        </button>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <i className="bi bi-receipt" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Chưa có hóa đơn nào</p>
          <p style={{ fontSize: '0.9rem' }}>Nhấn "Tạo hóa đơn mới" để thêm hóa đơn</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Phòng</th>
                <th>Tháng/Năm</th>
                <th>Tiền phòng</th>
                <th>Tiền điện</th>
                <th>Tiền nước</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td><strong>{payment.studentName}</strong></td>
                  <td>{payment.roomNumber}</td>
                  <td>{payment.month}/{payment.year}</td>
                  <td>{parseFloat(payment.roomFee).toLocaleString('vi-VN')} đ</td>
                  <td>
                    {parseFloat(payment.electricityFee).toLocaleString('vi-VN')} đ
                    <br />
                    <small style={{ color: '#64748b' }}>({payment.electricityUsage} kWh)</small>
                  </td>
                  <td>
                    {parseFloat(payment.waterFee).toLocaleString('vi-VN')} đ
                    <br />
                    <small style={{ color: '#64748b' }}>({payment.waterUsage} m³)</small>
                  </td>
                  <td><strong>{parseFloat(payment.totalAmount).toLocaleString('vi-VN')} đ</strong></td>
                  <td>
                    <span className={`status-badge ${
                      payment.status === 'Đã thanh toán' ? 'status-approved' : 'status-pending'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {payment.status === 'Chưa thanh toán' && (
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => {
                            setEditingPayment(payment);
                            setShowEditPaymentModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDeletePayment(payment.id)}
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

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo hóa đơn mới</h3>
              <button className="btn-close" onClick={() => setShowPaymentModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Sinh viên <span className="required">*</span></label>
                <select
                  value={newPayment.studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                >
                  <option value="">Chọn sinh viên</option>
                  {studentsWithRooms.map(student => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.studentName} - Phòng {student.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tháng</label>
                  <select
                    value={newPayment.month}
                    onChange={(e) => setNewPayment({...newPayment, month: parseInt(e.target.value)})}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Năm</label>
                  <input
                    type="number"
                    value={newPayment.year}
                    onChange={(e) => setNewPayment({...newPayment, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tiền phòng (VNĐ)</label>
                <input
                  type="number"
                  value={newPayment.roomFee}
                  onChange={(e) => setNewPayment({...newPayment, roomFee: parseFloat(e.target.value)})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Số điện (kWh)</label>
                  <input
                    type="number"
                    value={newPayment.electricityUsage}
                    onChange={(e) => {
                      const usage = parseInt(e.target.value) || 0;
                      setNewPayment({
                        ...newPayment, 
                        electricityUsage: usage,
                        electricityFee: calculateElectricityFee(usage)
                      });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Tiền điện (VNĐ)</label>
                  <input
                    type="number"
                    value={newPayment.electricityFee}
                    readOnly
                    style={{ background: '#f1f5f9' }}
                  />
                  <small className="form-hint">3,000 đ/kWh</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Số nước (m³)</label>
                  <input
                    type="number"
                    value={newPayment.waterUsage}
                    onChange={(e) => {
                      const usage = parseInt(e.target.value) || 0;
                      setNewPayment({
                        ...newPayment, 
                        waterUsage: usage,
                        waterFee: calculateWaterFee(usage)
                      });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Tiền nước (VNĐ)</label>
                  <input
                    type="number"
                    value={newPayment.waterFee}
                    readOnly
                    style={{ background: '#f1f5f9' }}
                  />
                  <small className="form-hint">15,000 đ/m³</small>
                </div>
              </div>

              <div className="form-group">
                <label>Tổng tiền</label>
                <input
                  type="text"
                  value={getTotalAmount(newPayment).toLocaleString('vi-VN') + ' đ'}
                  readOnly
                  style={{ background: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem' }}
                />
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  value={newPayment.note}
                  onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
                  placeholder="Nhập ghi chú (nếu có)"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleCreatePayment}>
                <i className="bi bi-check-lg"></i> Tạo hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentModal && editingPayment && (
        <div className="modal-overlay" onClick={() => setShowEditPaymentModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa hóa đơn</h3>
              <button className="btn-close" onClick={() => setShowEditPaymentModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin cơ bản</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Sinh viên:</label>
                    <span>{editingPayment.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phòng:</label>
                    <span>{editingPayment.roomNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tháng/Năm:</label>
                    <span>{editingPayment.month}/{editingPayment.year}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tiền phòng (VNĐ)</label>
                <input
                  type="number"
                  value={editingPayment.roomFee}
                  onChange={(e) => setEditingPayment({...editingPayment, roomFee: parseFloat(e.target.value)})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Số điện (kWh)</label>
                  <input
                    type="number"
                    value={editingPayment.electricityUsage}
                    onChange={(e) => {
                      const usage = parseInt(e.target.value) || 0;
                      setEditingPayment({
                        ...editingPayment, 
                        electricityUsage: usage,
                        electricityFee: calculateElectricityFee(usage)
                      });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Tiền điện (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPayment.electricityFee}
                    readOnly
                    style={{ background: '#f1f5f9' }}
                  />
                  <small className="form-hint">3,000 đ/kWh</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Số nước (m³)</label>
                  <input
                    type="number"
                    value={editingPayment.waterUsage}
                    onChange={(e) => {
                      const usage = parseInt(e.target.value) || 0;
                      setEditingPayment({
                        ...editingPayment, 
                        waterUsage: usage,
                        waterFee: calculateWaterFee(usage)
                      });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Tiền nước (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPayment.waterFee}
                    readOnly
                    style={{ background: '#f1f5f9' }}
                  />
                  <small className="form-hint">15,000 đ/m³</small>
                </div>
              </div>

              <div className="form-group">
                <label>Tổng tiền</label>
                <input
                  type="text"
                  value={getTotalAmount(editingPayment).toLocaleString('vi-VN') + ' đ'}
                  readOnly
                  style={{ background: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem' }}
                />
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  value={editingPayment.note || ''}
                  onChange={(e) => setEditingPayment({...editingPayment, note: e.target.value})}
                  placeholder="Nhập ghi chú (nếu có)"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditPaymentModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleUpdatePayment}>
                <i className="bi bi-check-lg"></i> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
