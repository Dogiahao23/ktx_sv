const db = require('../db');

// Lấy tất cả phòng với thông tin sinh viên
exports.getAll = async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT 
        p.MaPhong as id,
        p.Toa as building,
        p.TenPhong as roomNumber,
        p.LoaiPhong as roomType,
        p.SoGiuong as capacity,
        p.GiaThue as price,
        p.TrangThai as status,
        COUNT(DISTINCT sv.MaSV) as currentOccupancy
      FROM phong p
      LEFT JOIN hopdong hd ON p.MaPhong = hd.MaPhong AND hd.TrangThai = 'Đang hiệu lực'
      LEFT JOIN sinhvien sv ON hd.MaSV = sv.MaSV
      GROUP BY p.MaPhong
      ORDER BY p.Toa, p.TenPhong
    `);
    
    res.json(rooms);
  } catch (err) {
    console.error('Error in getAll rooms:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy phòng trống (public)
exports.getAvailable = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM phong WHERE TrangThai = 'Trống'");
    res.json(rows);
  } catch (err) {
    console.error('Error in getAvailable:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo phòng mới
exports.create = async (req, res) => {
  try {
    const { building, roomNumber, capacity, price } = req.body;
    
    // Kiểm tra số phòng đã tồn tại chưa
    const [existing] = await db.query('SELECT MaPhong FROM phong WHERE TenPhong = ? AND Toa = ?', [roomNumber, building]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Số phòng đã tồn tại trong tòa này' });
    }
    
    // Tạo phòng mới
    const [result] = await db.query(
      `INSERT INTO phong (Toa, TenPhong, LoaiPhong, SoGiuong, GiaThue, TrangThai) 
       VALUES (?, ?, ?, ?, ?, 'Trống')`,
      [building, roomNumber, `${capacity} người`, capacity, price]
    );
    
    res.json({ 
      id: result.insertId,
      message: 'Tạo phòng thành công'
    });
  } catch (err) {
    console.error('Error in create room:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách sinh viên đã được duyệt (chưa có phòng)
exports.getApprovedStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT 
        dd.MaDon as registrationId,
        dd.MaSinhVien as studentCode,
        dd.HoTen as fullName,
        dd.Email as email,
        dd.SDT as phone
      FROM dondangky dd
      LEFT JOIN sinhvien sv ON LOWER(TRIM(sv.HoTen)) = LOWER(TRIM(dd.HoTen))
      LEFT JOIN hopdong hd ON sv.MaSV = hd.MaSV AND hd.TrangThai = 'Đang hiệu lực'
      WHERE dd.TrangThai = 'approved' AND hd.MaHD IS NULL
      ORDER BY dd.NgayDangKy DESC
    `);
    
    res.json(students);
  } catch (err) {
    console.error('Error in getApprovedStudents:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thêm sinh viên vào phòng
exports.addStudentToRoom = async (req, res) => {
  try {
    const { roomId, studentCode } = req.body;
    
    // Kiểm tra phòng còn chỗ không
    const [room] = await db.query(`
      SELECT 
        p.SoGiuong as capacity,
        COUNT(DISTINCT hd.MaSV) as currentOccupancy
      FROM phong p
      LEFT JOIN hopdong hd ON p.MaPhong = hd.MaPhong AND hd.TrangThai = 'Đang hiệu lực'
      WHERE p.MaPhong = ?
      GROUP BY p.MaPhong
    `, [roomId]);
    
    if (room.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    
    if (room[0].currentOccupancy >= room[0].capacity) {
      return res.status(400).json({ message: 'Phòng đã đầy' });
    }
    
    // Tìm sinh viên từ đơn đăng ký (join theo tên vì MaSinhVien có thể khác format với MaSV)
    const [student] = await db.query(`
      SELECT sv.MaSV 
      FROM dondangky dd
      LEFT JOIN sinhvien sv ON LOWER(TRIM(sv.HoTen)) = LOWER(TRIM(dd.HoTen))
      WHERE dd.MaSinhVien = ? AND dd.TrangThai = 'approved'
      LIMIT 1
    `, [studentCode]);
    
    if (student.length === 0 || !student[0].MaSV) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên hoặc chưa được duyệt' });
    }
    
    // Kiểm tra sinh viên đã ở trong phòng này chưa
    const [existingContract] = await db.query(`
      SELECT MaHD 
      FROM hopdong 
      WHERE MaSV = ? AND MaPhong = ? AND TrangThai = 'Đang hiệu lực'
    `, [student[0].MaSV, roomId]);
    
    if (existingContract.length > 0) {
      return res.status(400).json({ message: 'Sinh viên đã ở trong phòng này rồi' });
    }
    
    // Kiểm tra sinh viên đã có phòng khác chưa
    const [otherContract] = await db.query(`
      SELECT p.TenPhong as roomNumber
      FROM hopdong hd
      INNER JOIN phong p ON hd.MaPhong = p.MaPhong
      WHERE hd.MaSV = ? AND hd.TrangThai = 'Đang hiệu lực'
    `, [student[0].MaSV]);
    
    if (otherContract.length > 0) {
      return res.status(400).json({ 
        message: `Sinh viên đã ở phòng ${otherContract[0].roomNumber}. Vui lòng chuyển phòng trước.` 
      });
    }
    
    // Tạo hợp đồng
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Hợp đồng 1 năm
    
    await db.query(
      `INSERT INTO hopdong (MaSV, MaPhong, NgayBatDau, NgayKetThuc, TrangThai)
       VALUES (?, ?, ?, ?, 'Đang hiệu lực')`,
      [student[0].MaSV, roomId, startDate, endDate]
    );
    
    // Cập nhật trạng thái phòng
    const newOccupancy = room[0].currentOccupancy + 1;
    const newStatus = newOccupancy === 0 ? 'Trống' : 
                     newOccupancy < room[0].capacity ? 'Đang ở' : 'Đầy';
    await db.query("UPDATE phong SET TrangThai = ? WHERE MaPhong = ?", [newStatus, roomId]);
    
    res.json({ message: 'Thêm sinh viên vào phòng thành công' });
  } catch (err) {
    console.error('Error in addStudentToRoom:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách sinh viên trong phòng
exports.getStudentsInRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const [students] = await db.query(`
      SELECT DISTINCT
        sv.MaSV as studentId,
        sv.HoTen as fullName,
        COALESCE(sv.Email, dd.Email) as email,
        COALESCE(sv.SDT, dd.SDT) as phone,
        MAX(hd.NgayBatDau) as startDate,
        MAX(hd.NgayKetThuc) as endDate
      FROM hopdong hd
      INNER JOIN sinhvien sv ON hd.MaSV = sv.MaSV
      LEFT JOIN dondangky dd ON LOWER(TRIM(sv.HoTen)) = LOWER(TRIM(dd.HoTen)) 
        AND dd.TrangThai = 'approved'
      WHERE hd.MaPhong = ? AND hd.TrangThai = 'Đang hiệu lực'
      GROUP BY sv.MaSV, sv.HoTen, sv.Email, sv.SDT, dd.Email, dd.SDT
      ORDER BY startDate DESC
    `, [roomId]);
    
    res.json(students);
  } catch (err) {
    console.error('Error in getStudentsInRoom:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Kiểm tra phòng có sinh viên không
    const [contracts] = await db.query(`
      SELECT COUNT(*) as count 
      FROM hopdong 
      WHERE MaPhong = ? AND TrangThai = 'Đang hiệu lực'
    `, [roomId]);
    
    if (contracts[0].count > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa phòng đang có sinh viên ở. Vui lòng chuyển sinh viên ra trước.' 
      });
    }
    
    // Xóa phòng
    await db.query('DELETE FROM phong WHERE MaPhong = ?', [roomId]);
    
    res.json({ message: 'Xóa phòng thành công' });
  } catch (err) {
    console.error('Error in deleteRoom:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa sinh viên khỏi phòng
exports.removeStudentFromRoom = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    
    // Xóa hợp đồng
    const [result] = await db.query(`
      DELETE FROM hopdong 
      WHERE MaSV = ? AND MaPhong = ? AND TrangThai = 'Đang hiệu lực'
    `, [studentId, roomId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }
    
    // Cập nhật trạng thái phòng
    const [room] = await db.query(`
      SELECT 
        p.SoGiuong as capacity,
        COUNT(DISTINCT hd.MaSV) as currentOccupancy
      FROM phong p
      LEFT JOIN hopdong hd ON p.MaPhong = hd.MaPhong AND hd.TrangThai = 'Đang hiệu lực'
      WHERE p.MaPhong = ?
      GROUP BY p.MaPhong
    `, [roomId]);
    
    if (room.length > 0) {
      const newStatus = room[0].currentOccupancy === 0 ? 'Trống' : 
                       room[0].currentOccupancy < room[0].capacity ? 'Đang ở' : 'Đầy';
      await db.query("UPDATE phong SET TrangThai = ? WHERE MaPhong = ?", [newStatus, roomId]);
    }
    
    res.json({ message: 'Xóa sinh viên khỏi phòng thành công' });
  } catch (err) {
    console.error('Error in removeStudentFromRoom:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật thông tin phòng
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { building, roomNumber, capacity, price } = req.body;
    
    // Kiểm tra số phòng đã tồn tại chưa trong cùng tòa (trừ phòng hiện tại)
    const [existing] = await db.query(
      'SELECT MaPhong FROM phong WHERE TenPhong = ? AND Toa = ? AND MaPhong != ?', 
      [roomNumber, building, roomId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Số phòng đã tồn tại trong tòa này' });
    }
    
    // Kiểm tra nếu giảm sức chứa, phải đảm bảo không nhỏ hơn số người hiện tại
    const [currentRoom] = await db.query(`
      SELECT COUNT(DISTINCT hd.MaSV) as currentOccupancy
      FROM phong p
      LEFT JOIN hopdong hd ON p.MaPhong = hd.MaPhong AND hd.TrangThai = 'Đang hiệu lực'
      WHERE p.MaPhong = ?
      GROUP BY p.MaPhong
    `, [roomId]);
    
    if (currentRoom.length > 0 && currentRoom[0].currentOccupancy > capacity) {
      return res.status(400).json({ 
        message: `Không thể giảm sức chứa xuống ${capacity} vì phòng đang có ${currentRoom[0].currentOccupancy} sinh viên` 
      });
    }
    
    // Cập nhật thông tin phòng
    const roomType = `${capacity} người`;
    await db.query(
      `UPDATE phong 
       SET Toa = ?, TenPhong = ?, LoaiPhong = ?, SoGiuong = ?, GiaThue = ?
       WHERE MaPhong = ?`,
      [building, roomNumber, roomType, capacity, price, roomId]
    );
    
    // Cập nhật lại trạng thái phòng
    const occupancy = currentRoom.length > 0 ? currentRoom[0].currentOccupancy : 0;
    const newStatus = occupancy === 0 ? 'Trống' : 
                     occupancy < capacity ? 'Đang ở' : 'Đầy';
    await db.query("UPDATE phong SET TrangThai = ? WHERE MaPhong = ?", [newStatus, roomId]);
    
    res.json({ message: 'Cập nhật phòng thành công' });
  } catch (err) {
    console.error('Error in updateRoom:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
