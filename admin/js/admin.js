// admin/js/admin.js
// ══════════════════════════════════════════
//  ⚠️  SỬA DÒNG NÀY THEO MÔI TRƯỜNG:
//  Local:      'http://localhost:8080/LIS/backend'
//  Production: 'https://yourdomain.com/LIS/backend'
// ══════════════════════════════════════════
const API_BASE = 'http://localhost:8080/LIS/backend';

// ── Auth ──
const Auth = {
  getToken()   { return localStorage.getItem('lis_admin_token'); },
  getAdmin()   { try { return JSON.parse(localStorage.getItem('lis_admin_info')); } catch { return null; } },
  isLoggedIn() { return !!this.getToken(); },
  login(token, admin) {
    localStorage.setItem('lis_admin_token', token);
    localStorage.setItem('lis_admin_info', JSON.stringify(admin));
  },
  logout() {
    localStorage.removeItem('lis_admin_token');
    localStorage.removeItem('lis_admin_info');
    location.href = '/LIS/admin/login';
  },
  require() {
    if (!this.isLoggedIn()) { location.href = '/LIS/admin/login'; throw new Error('Not authenticated'); }
  },
};

// ── API client (kèm JWT header) ──
const API = {
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(API_BASE + path, opts);
    if (res.status === 401) { Auth.logout(); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
  },
  get:    (p)    => API.request('GET',    p),
  post:   (p, b) => API.request('POST',   p, b),
  put:    (p, b) => API.request('PUT',    p, b),
  delete: (p)    => API.request('DELETE', p),
};

// ── Upload ảnh ──
async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res  = await fetch(API_BASE + '/api/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
    body: form,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.url;
}

// ── Toast ──
function toast(msg, type = 'info') {
  let wrap = document.getElementById('toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}

// ── Format ──
const fmt = {
  price:     n => Number(n).toLocaleString('vi-VN') + 'đ',
  date:      s => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  shortDate: s => new Date(s).toLocaleDateString('vi-VN'),
};

// ── Status ──
const STATUS = {
  pending:    { label: 'Chờ xác nhận', cls: 'status-pending' },
  processing: { label: 'Đang xử lý',   cls: 'status-processing' },
  shipping:   { label: 'Đang giao',    cls: 'status-shipping' },
  completed:  { label: 'Hoàn thành',   cls: 'status-completed' },
  cancelled:  { label: 'Đã huỷ',       cls: 'status-cancelled' },
};
function statusBadge(s) {
  const st = STATUS[s] || { label: s, cls: '' };
  return `<span class="status ${st.cls}">${st.label}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const admin = Auth.getAdmin();
  document.querySelectorAll('[data-admin-name]').forEach(el => {
    if (admin) el.textContent = admin.name || admin.username;
  });
  const page = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
});
