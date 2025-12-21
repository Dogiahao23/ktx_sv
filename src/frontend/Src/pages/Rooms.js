import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/rooms/available'); // public
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h3>Danh sách phòng trống</h3>
      <table className="table">
        <thead><tr><th>#</th><th>Tòa nhà</th><th>Số phòng</th><th>Loại</th><th>Giá</th></tr></thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.MaPhong}>
              <td>{r.MaPhong}</td>
              <td>{r.ToaNha}</td>
              <td>{r.SoPhong}</td>
              <td>{r.LoaiPhong}</td>
              <td>{r.GiaPhong}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
