// frontend/js/api.js
// ── Đổi BASE_URL theo môi trường ──
const API_BASE = 'http://localhost/lis/backend';
// Production: const API_BASE = 'https://api.lis-sport.vn';

const API = {
  async request(method, path, body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(API_BASE + path, options);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
  },

  get:    (path)        => API.request('GET',    path),
  post:   (path, body)  => API.request('POST',   path, body),
  put:    (path, body)  => API.request('PUT',    path, body),
  delete: (path)        => API.request('DELETE', path),

  // Shorthand
  products: {
    list:   (params = {}) => API.get('/api/products?' + new URLSearchParams(params)),
    get:    (id)          => API.get(`/api/products/${id}`),
    slug:   (slug)        => API.get(`/api/products/slug/${slug}`),
  },
  orders: {
    create: (body)  => API.post('/api/orders', body),
    track:  (code)  => API.get(`/api/orders/track/${code}`),
  },
  settings: {
    get: () => API.get('/api/settings'),
  },
};

// ── Cart (localStorage) ──
const Cart = {
  KEY: 'lis_cart',
  get()         { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(items)   { localStorage.setItem(this.KEY, JSON.stringify(items)); this._notify(); },
  clear()       { localStorage.removeItem(this.KEY); this._notify(); },

  add(product, color, size, qty = 1) {
    const items = this.get();
    const key   = `${product.id}_${color}_${size}`;
    const found = items.find(i => i.key === key);
    if (found) found.quantity += qty;
    else items.push({
      key, product_id: product.id,
      name: product.name,
      price: product.display_price,
      image: product.images?.[0] || '',
      color, size, quantity: qty,
    });
    this.save(items);
    Toast.show('Đã thêm vào giỏ hàng 🛒', 'success');
  },

  remove(key)       { this.save(this.get().filter(i => i.key !== key)); },
  update(key, qty)  {
    if (qty <= 0) return this.remove(key);
    const items = this.get();
    const item  = items.find(i => i.key === key);
    if (item) { item.quantity = qty; this.save(items); }
  },

  count()  { return this.get().reduce((s, i) => s + i.quantity, 0); },
  total()  { return this.get().reduce((s, i) => s + i.price * i.quantity, 0); },

  _notify() {
    // Cập nhật badge
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = this.count();
      el.style.display = this.count() > 0 ? 'flex' : 'none';
    });
    // Dispatch event để các trang lắng nghe
    window.dispatchEvent(new CustomEvent('cart:updated'));
  },
};

// ── Toast ──
const Toast = {
  show(msg, type = 'info', duration = 3000) {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px';
      document.body.appendChild(wrap);
    }
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast--show'));
    setTimeout(() => { t.classList.remove('toast--show'); setTimeout(() => t.remove(), 300); }, duration);
  },
};

// ── Format helpers ──
const fmt = {
  price: n => Number(n).toLocaleString('vi-VN') + 'đ',
  date:  s => new Date(s).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
};

// Order status map
const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: '#f59e0b' },
  processing: { label: 'Đang xử lý',   color: '#3b82f6' },
  shipping:   { label: 'Đang giao',    color: '#8b5cf6' },
  completed:  { label: 'Hoàn thành',   color: '#10b981' },
  cancelled:  { label: 'Đã huỷ',       color: '#ef4444' },
};

// Khởi tạo cart badge khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => Cart._notify());
