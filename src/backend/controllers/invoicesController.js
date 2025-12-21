const db = require('../db');

exports.getByContract = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM HoaDon WHERE MaHD = ?', [req.params.contractId]);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};

exports.create = async (req, res) => {
  try {
    const { MaHD, Thang, SoDien, SoNuoc, TongTien } = req.body;
    const [r] = await db.query('INSERT INTO HoaDon (MaHD, Thang, SoDien, SoNuoc, TongTien, TrangThai) VALUES (?, ?, ?, ?, ?, "Chua thanh toan")', [MaHD, Thang, SoDien, SoNuoc, TongTien]);
    res.json({ id: r.insertId });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
};
