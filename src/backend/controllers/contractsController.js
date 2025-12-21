const db = require('../db');

exports.create = async (req, res) => {
  try {
    const { MaSV, MaPhong, NgayThue, NgayTra } = req.body;
    const [r] = await db.query('INSERT INTO HopDong (MaSV, MaPhong, NgayThue, NgayTra, TinhTrang) VALUES (?, ?, ?, ?, "Con hieu luc")', [MaSV, MaPhong, NgayThue, NgayTra]);
    // cập nhật trạng thái phòng
    await db.query("UPDATE Phong SET TrangThai = 'Da thue' WHERE MaPhong = ?", [MaPhong]);
    res.json({ id: r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
