export function saveToken(token) {
  localStorage.setItem('ktx_token', token);
}
export function getToken() {
  return localStorage.getItem('ktx_token');
}
export function removeToken() {
  localStorage.removeItem('ktx_token');
}
