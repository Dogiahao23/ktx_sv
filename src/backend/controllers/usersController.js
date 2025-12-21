const db = require('../db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        t.MaTK as id,
        t.TenDangNhap as username,
        COALESCE(s.Email, '') as email,
        t.VaiTro as role,
        CASE WHEN t.TrangThai = 1 THEN 'active' ELSE 'inactive' END as status,
        DATE_FORMAT(t.NgayTao, '%Y-%m-%d') as createdAt
      FROM taikhoan t
      LEFT JOIN sinhvien s ON t.MaTK = s.MaTK
      ORDER BY t.NgayTao DESC
    `);
    
    res.json(users);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;
    
    // Cập nhật taikhoan
    await db.query(
      'UPDATE taikhoan SET VaiTro = ?, TrangThai = ? WHERE MaTK = ?',
      [role, status === 'active' ? 1 : 0, id]
    );
    
    // Cập nhật email trong sinhvien nếu có
    if (email) {
      await db.query(
        'UPDATE sinhvien SET Email = ? WHERE MaTK = ?',
        [email, id]
      );
    }
    
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Xóa tài khoản (cascade sẽ xóa sinhvien liên quan)
    await db.query('DELETE FROM taikhoan WHERE MaTK = ?', [id]);
    
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    
    await db.query('UPDATE taikhoan SET MatKhau = ? WHERE MaTK = ?', [hash, id]);
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('Error in changePassword:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
