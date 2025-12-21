const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  try {
    const { username, password, role, email, fullName, phone } = req.body;
    
    // Kiểm tra username đã tồn tại
    const [rows] = await db.query('SELECT MaTK FROM taikhoan WHERE TenDangNhap = ?', [username]);
    if (rows.length) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    
    // Hash mật khẩu
    const hash = await bcrypt.hash(password, 10);
    
    // Thêm tài khoản
    const [r] = await db.query(
      'INSERT INTO taikhoan (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES (?, ?, ?, 1)', 
      [username, hash, role || 'SinhVien']
    );
    
    // Nếu có thông tin sinh viên, thêm vào bảng sinhvien
    if (email || fullName || phone) {
      await db.query(
        'INSERT INTO sinhvien (MaTK, HoTen, Email, SDT) VALUES (?, ?, ?, ?)',
        [r.insertId, fullName || username, email || null, phone || null]
      );
    }
    
    res.json({ id: r.insertId, username, message: 'Đăng ký thành công' });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM taikhoan WHERE TenDangNhap = ?', [username]);
    
    if (!rows.length) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = rows[0];
    
    // Kiểm tra trạng thái tài khoản
    if (user.TrangThai === 0) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
        locked: true 
      });
    }
    
    // Kiểm tra mật khẩu
    const ok = await bcrypt.compare(password, user.MatKhau);
    if (!ok) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    // Tạo token
    const token = jwt.sign({ id: user.MaTK, role: user.VaiTro }, JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ 
      token, 
      role: user.VaiTro, 
      id: user.MaTK,
      username: user.TenDangNhap
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
