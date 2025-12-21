const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SinhVien');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SinhVien WHERE MaSV = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  try {
    const { HoTen, Lop, NgaySinh, GioiTinh, SDT, Email, DiaChi, MaTK } = req.body;
    const [r] = await db.query('INSERT INTO SinhVien (HoTen, Lop, NgaySinh, GioiTinh, SDT, Email, DiaChi, MaTK) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [HoTen, Lop, NgaySinh, GioiTinh, SDT, Email, DiaChi, MaTK]);
    res.json({ id: r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
