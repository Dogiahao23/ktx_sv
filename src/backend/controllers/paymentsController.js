const db = require('../db');

// Lấy tất cả hóa đơn (Admin)
exports.getAll = async (req, res) => {
  try {
    const [invoices] = await db.query(`
      SELECT 
        hd.MaHoaDon as id,
        hd.MaSV as studentId,
        sv.HoTen as studentName,
        hd.MaPhong as roomId,
        CONCAT(p.Toa, p.TenPhong) as roomNumber,
        hd.Thang as month,
        hd.Nam as year,
        hd.TienPhong as roomFee,
        hd.TienDien as electricityFee,
        hd.TienNuoc as waterFee,
        hd.SoDien as electricityUsage,
        hd.SoNuoc as waterUsage,
        hd.TongTien as totalAmount,
        hd.TrangThai as status,
        hd.NgayTao as createdAt,
        hd.NgayThanhToan as paidAt,
        hd.GhiChu as note
      FROM hoadon hd
      INNER JOIN sinhvien sv ON hd.MaSV = sv.MaSV
      INNER JOIN phong p ON hd.MaPhong = p.MaPhong
      ORDER BY hd.Nam DESC, hd.Thang DESC, hd.NgayTao DESC
    `);
    
    res.json(invoices);
  } catch (err) {
    console.error('Error in getAll invoices:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy hóa đơn của sinh viên
exports.getByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Tìm MaSV từ MaTK (account ID)
    // Giả sử sinh viên có tên trong bảng sinhvien trùng với username hoặc có liên kết
    // Hoặc tìm theo tên đăng nhập
    const [student] = await db.query(`
      SELECT sv.MaSV 
      FROM sinhvien sv
      INNER JOIN taikhoan tk ON LOWER(TRIM(sv.HoTen)) = LOWER(TRIM(tk.TenDangNhap))
      WHERE tk.MaTK = ?
      LIMIT 1
    `, [studentId]);
    
    if (student.length === 0) {
      return res.json([]);
    }
    
    const maSV = student[0].MaSV;
    
    const [invoices] = await db.query(`
      SELECT 
        hd.MaHoaDon as id,
        hd.MaPhong as roomId,
        CONCAT(p.Toa, p.TenPhong) as roomNumber,
        hd.Thang as month,
        hd.Nam as year,
        hd.TienPhong as roomFee,
        hd.TienDien as electricityFee,
        hd.TienNuoc as waterFee,
        hd.SoDien as electricityUsage,
        hd.SoNuoc as waterUsage,
        hd.TongTien as totalAmount,
        hd.TrangThai as status,
        hd.NgayTao as createdAt,
        hd.NgayThanhToan as paidAt,
        hd.GhiChu as note
      FROM hoadon hd
      INNER JOIN phong p ON hd.MaPhong = p.MaPhong
      WHERE hd.MaSV = ?
      ORDER BY hd.Nam DESC, hd.Thang DESC
    `, [maSV]);
    
    res.json(invoices);
  } catch (err) {
    console.error('Error in getByStudent:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Tạo hóa đơn mới (Admin)
exports.create = async (req, res) => {
  try {
    const { studentId, roomId, month, year, roomFee, electricityFee, waterFee, electricityUsage, waterUsage, note } = req.body;
    
    // Kiểm tra hóa đơn đã tồn tại chưa
    const [existing] = await db.query(
      'SELECT MaHoaDon FROM hoadon WHERE MaSV = ? AND Thang = ? AND Nam = ?',
      [studentId, month, year]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Hóa đơn tháng này đã tồn tại' });
    }
    
    // Tính tổng tiền
    const totalAmount = parseFloat(roomFee || 0) + parseFloat(electricityFee || 0) + parseFloat(waterFee || 0);
    
    // Tạo hóa đơn
    const [result] = await db.query(
      `INSERT INTO hoadon (MaSV, MaPhong, Thang, Nam, TienPhong, TienDien, TienNuoc, SoDien, SoNuoc, TongTien, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, roomId, month, year, roomFee, electricityFee, waterFee, electricityUsage, waterUsage, totalAmount, note]
    );
    
    res.json({ 
      id: result.insertId,
      message: 'Tạo hóa đơn thành công'
    });
  } catch (err) {
    console.error('Error in create invoice:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật hóa đơn (Admin)
exports.update = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { roomFee, electricityFee, waterFee, electricityUsage, waterUsage, note } = req.body;
    
    // Tính tổng tiền
    const totalAmount = parseFloat(roomFee || 0) + parseFloat(electricityFee || 0) + parseFloat(waterFee || 0);
    
    await db.query(
      `UPDATE hoadon 
       SET TienPhong = ?, TienDien = ?, TienNuoc = ?, SoDien = ?, SoNuoc = ?, TongTien = ?, GhiChu = ?
       WHERE MaHoaDon = ?`,
      [roomFee, electricityFee, waterFee, electricityUsage, waterUsage, totalAmount, note, invoiceId]
    );
    
    res.json({ message: 'Cập nhật hóa đơn thành công' });
  } catch (err) {
    console.error('Error in update invoice:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thanh toán hóa đơn
exports.pay = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    await db.query(
      `UPDATE hoadon 
       SET TrangThai = 'Đã thanh toán', NgayThanhToan = NOW()
       WHERE MaHoaDon = ?`,
      [invoiceId]
    );
    
    res.json({ message: 'Thanh toán thành công' });
  } catch (err) {
    console.error('Error in pay invoice:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa hóa đơn (Admin)
exports.delete = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    await db.query('DELETE FROM hoadon WHERE MaHoaDon = ?', [invoiceId]);
    
    res.json({ message: 'Xóa hóa đơn thành công' });
  } catch (err) {
    console.error('Error in delete invoice:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy sinh viên đang ở trong phòng (để tạo hóa đơn)
exports.getStudentsWithRooms = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT DISTINCT
        sv.MaSV as studentId,
        sv.HoTen as studentName,
        p.MaPhong as roomId,
        CONCAT(p.Toa, p.TenPhong) as roomNumber,
        p.GiaThue as roomPrice
      FROM sinhvien sv
      INNER JOIN hopdong hd ON sv.MaSV = hd.MaSV
      INNER JOIN phong p ON hd.MaPhong = p.MaPhong
      WHERE hd.TrangThai = 'Đang hiệu lực'
      ORDER BY p.Toa, p.TenPhong, sv.HoTen
    `);
    
    res.json(students);
  } catch (err) {
    console.error('Error in getStudentsWithRooms:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thống kê thanh toán
exports.getStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalInvoices,
        SUM(CASE WHEN TrangThai = 'Chưa thanh toán' THEN 1 ELSE 0 END) as unpaidCount,
        SUM(CASE WHEN TrangThai = 'Đã thanh toán' THEN 1 ELSE 0 END) as paidCount,
        SUM(CASE WHEN TrangThai = 'Chưa thanh toán' THEN TongTien ELSE 0 END) as unpaidAmount,
        SUM(CASE WHEN TrangThai = 'Đã thanh toán' THEN TongTien ELSE 0 END) as paidAmount
      FROM hoadon
    `);
    
    res.json(stats[0]);
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
