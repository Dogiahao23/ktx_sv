const db = require('../db');

exports.getStats = async (req, res) => {
  try {
    // 1. Đếm tổng sinh viên (users có role = SinhVien)
    const [studentCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM taikhoan 
      WHERE VaiTro = 'SinhVien'
    `);
    
    // 2. Đếm tổng phòng
    const [roomCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM phong
    `);
    
    // 3. Đếm đơn đã duyệt
    const [approvedCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM dondangky
      WHERE TrangThai = 'approved'
    `);
    
    // 4. Đếm đơn đăng ký chờ duyệt
    const [pendingCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM dondangky 
      WHERE TrangThai = 'pending'
    `);
    
    // 5. Đếm đơn từ chối
    const [rejectedCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM dondangky 
      WHERE TrangThai = 'rejected'
    `);
    
    // 6. Đếm phòng trống
    const [availableRoomCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM phong 
      WHERE TrangThai = 'Trống'
    `);
    
    // 7. Đếm hợp đồng đang hiệu lực
    const [activeContractCount] = await db.query(`
      SELECT COUNT(*) as total 
      FROM hopdong 
      WHERE TrangThai = 'Đang hiệu lực'
    `);
    
    res.json({
      totalStudents: studentCount[0].total,
      totalRooms: roomCount[0].total,
      approvedRegistrations: approvedCount[0].total,
      pendingRegistrations: pendingCount[0].total,
      rejectedRegistrations: rejectedCount[0].total,
      availableRooms: availableRoomCount[0].total,
      activeContracts: activeContractCount[0].total
    });
    
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
