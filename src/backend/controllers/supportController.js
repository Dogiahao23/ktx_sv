const pool = require('../db');

// Tạo yêu cầu hỗ trợ mới
exports.createSupportRequest = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO yeucauhotro (HoTen, Email, SoDienThoai, TinNhan) VALUES (?, ?, ?, ?)',
      [fullName, email, phone || null, message]
    );

    res.status(201).json({
      message: 'Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo yêu cầu hỗ trợ' });
  }
};

// Lấy tất cả yêu cầu hỗ trợ (chỉ cho Quản lý)
exports.getAllSupportRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM yeucauhotro ORDER BY NgayTao DESC'
    );

    res.json(requests);
  } catch (error) {
    console.error('Error fetching support requests:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách yêu cầu hỗ trợ' });
  }
};

// Cập nhật trạng thái yêu cầu hỗ trợ
exports.updateSupportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Chờ xử lý', 'Đang xử lý', 'Đã xử lý'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    await pool.query(
      'UPDATE yeucauhotro SET TrangThai = ? WHERE MaYeuCau = ?',
      [status, id]
    );

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Error updating support status:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
  }
};

// Xóa yêu cầu hỗ trợ
exports.deleteSupportRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM yeucauhotro WHERE MaYeuCau = ?', [id]);

    res.json({ message: 'Xóa yêu cầu hỗ trợ thành công' });
  } catch (error) {
    console.error('Error deleting support request:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa yêu cầu hỗ trợ' });
  }
};
