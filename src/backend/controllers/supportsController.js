const db = require('../db');

exports.create = async (req, res) => {
  try {
    const { MaSV, NoiDung } = req.body;
    const [r] = await db.query('INSERT INTO YeuCauHoTro (MaSV, NoiDung, NgayGui, TrangThai) VALUES (?, ?, NOW(), "Cho xu ly")', [MaSV, NoiDung]);
    res.json({ id: r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM YeuCauHoTro');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
