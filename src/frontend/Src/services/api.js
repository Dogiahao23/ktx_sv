import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// thêm interceptor gửi token nếu có
API.interceptors.request.use(config => {
  const token = localStorage.getItem('ktx_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
