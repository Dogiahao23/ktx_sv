const db = require('../db');

// Tạo đơn đăng ký mới
exports.create = async (req, res) => {
  try {
    const { fullName, studentId, email, phone, gender, birthDate, address } = req.body;
    
    console.log('📝 Received registration data:');
    console.log('birthDate (raw):', birthDate);
    
    // Kiểm tra mã sinh viên đã tồn tại chưa
    const [existing] = await db.query(
      'SELECT MaDon FROM dondangky WHERE MaSinhVien = ?',
      [studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Mã sinh viên đã đăng ký trước đó' });
    }
    
    // Convert birthDate to yyyy-mm-dd for MySQL
    let formattedBirthDate = null;
    if (birthDate) {
      console.log('birthDate type:', typeof birthDate);
      console.log('birthDate value:', birthDate);
      
      // Try to parse the date
      if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          // Check if it's dd/mm/yyyy or mm/dd/yyyy
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          
          // If day > 12, it must be dd/mm/yyyy format
          if (day > 12) {
            formattedBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          } else {
            // Assume dd/mm/yyyy format (European/Vietnamese style)
            formattedBirthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        }
      } else if (birthDate.includes('-')) {
        // Already in yyyy-mm-dd format
        formattedBirthDate = birthDate;
      }
    }
    
    console.log('birthDate (formatted):', formattedBirthDate);
    
    // Lấy đường dẫn file từ multer
    const idCardImage = req.files?.idCardFront ? `/uploads/${req.files.idCardFront[0].filename}` : null;
    const studentCardImage = req.files?.studentCard ? `/uploads/${req.files.studentCard[0].filename}` : null;
    
    // Thêm đơn đăng ký với ảnh
    const [result] = await db.query(
      `INSERT INTO dondangky (HoTen, MaSinhVien, Email, SDT, GioiTinh, NgaySinh, DiaChi, AnhCMND, AnhTheSV, TrangThai, NgayDangKy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [fullName, studentId, email, phone, gender, formattedBirthDate, address, idCardImage, studentCardImage]
    );
    
    res.json({ 
      id: result.insertId, 
      message: 'Đăng ký thành công! Vui lòng chờ xét duyệt.' 
    });
    
  } catch (err) {
    console.error('Error in create registration:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả đơn đăng ký
exports.getAll = async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT 
        MaDon as id,
        MaSinhVien as studentId,
        HoTen as fullName,
        Email as email,
        SDT as phone,
        GioiTinh as gender,
        NgaySinh as birthDate,
        DiaChi as address,
        AnhCMND as idCardImage,
        AnhTheSV as studentCardImage,
        TrangThai as status,
        DATE_FORMAT(NgayDangKy, '%Y-%m-%d') as date
      FROM dondangky
      ORDER BY NgayDangKy DESC
    `);
    
    res.json(registrations);
  } catch (err) {
    console.error('Error in getAll registrations:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Duyệt đơn đăng ký
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      "UPDATE dondangky SET TrangThai = 'approved' WHERE MaDon = ?",
      [id]
    );
    
    res.json({ message: 'Đã duyệt đơn đăng ký' });
  } catch (err) {
    console.error('Error in approve registration:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Từ chối đơn đăng ký
exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      "UPDATE dondangky SET TrangThai = 'rejected' WHERE MaDon = ?",
      [id]
    );
    
    res.json({ message: 'Đã từ chối đơn đăng ký' });
  } catch (err) {
    console.error('Error in reject registration:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa đơn đăng ký
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin đơn để xóa file ảnh
    const [registration] = await db.query(
      'SELECT AnhCMND, AnhTheSV FROM dondangky WHERE MaDon = ?',
      [id]
    );
    
    if (registration.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      // Xóa file ảnh CMND nếu có
      if (registration[0].AnhCMND) {
        const idCardPath = path.join(__dirname, '..', registration[0].AnhCMND);
        if (fs.existsSync(idCardPath)) {
          fs.unlinkSync(idCardPath);
        }
      }
      
      // Xóa file ảnh thẻ SV nếu có
      if (registration[0].AnhTheSV) {
        const studentCardPath = path.join(__dirname, '..', registration[0].AnhTheSV);
        if (fs.existsSync(studentCardPath)) {
          fs.unlinkSync(studentCardPath);
        }
      }
    }
    
    // Xóa đơn đăng ký khỏi database
    await db.query('DELETE FROM dondangky WHERE MaDon = ?', [id]);
    
    res.json({ message: 'Đã xóa đơn đăng ký' });
  } catch (err) {
    console.error('Error in delete registration:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
