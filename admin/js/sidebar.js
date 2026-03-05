// admin/js/sidebar.js — Inject sidebar vào mỗi trang admin
(function() {
  const SIDEBAR_HTML = `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div>
        <div class="brand">LIS</div>
        <div class="sub">Admin Panel</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Tổng quan</div>
      <a class="nav-item" data-page="dashboard.html" href="dashboard.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <div class="nav-label">Bán hàng</div>
      <a class="nav-item" data-page="orders.html" href="orders.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg>
        Đơn hàng
        <span class="pending-count" id="sidebar-pending" style="margin-left:auto;background:rgba(210,153,34,.2);color:#d29922;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;display:none">0</span>
      </a>
      <div class="nav-label">Danh mục</div>
      <a class="nav-item" data-page="products.html" href="products.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        Sản phẩm
      </a>
      <div class="nav-label">Hệ thống</div>
      <a class="nav-item" data-page="settings.html" href="settings.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Cài đặt
      </a>
    </nav>
    <div class="sidebar-footer">
      <div style="font-size:12px;color:var(--gray);margin-bottom:8px">Đăng nhập: <strong data-admin-name style="color:var(--white)">Admin</strong></div>
      <button class="logout-btn" onclick="Auth.logout()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Đăng xuất
      </button>
    </div>
  </aside>`;

  document.addEventListener('DOMContentLoaded', () => {
    Auth.require();
    document.body.insertAdjacentHTML('afterbegin', SIDEBAR_HTML);

    // Mark active nav item
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === currentPage);
    });

    // Set admin name
    const admin = Auth.getAdmin();
    document.querySelectorAll('[data-admin-name]').forEach(el => {
      if (admin) el.textContent = admin.name || admin.username;
    });

    // Load pending count
    loadPendingCount();
  });

  async function loadPendingCount() {
    try {
      const { stats } = await API.get('/api/orders?limit=1');
      const el = document.getElementById('sidebar-pending');
      if (el && stats?.pending > 0) {
        el.textContent = stats.pending;
        el.style.display = 'inline-block';
      }
    } catch {}
  }
})();
