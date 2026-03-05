// frontend/js/main.js

document.addEventListener('DOMContentLoaded', async () => {

  // ── Nav scroll effect ──
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ── Load settings (banner text) ──
  try {
    const { data: settings } = await API.settings.get();
    const bar = document.getElementById('announce-text');
    if (bar && settings.banner_text) bar.textContent = settings.banner_text;
  } catch {}

  // ── Load featured products ──
  const featGrid = document.getElementById('featured-grid');
  if (featGrid) {
    try {
      const { data: products } = await API.products.list({ featured: 1, limit: 4 });
      featGrid.innerHTML = products.length
        ? products.map(renderProductCard).join('')
        : '<p class="empty-msg">Chưa có sản phẩm nổi bật</p>';
    } catch {
      featGrid.innerHTML = '<p class="empty-msg">Không thể tải sản phẩm</p>';
    }
  }

  // ── Scroll reveal ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

});

// ── Render product card HTML ──
function renderProductCard(p) {
  const img = p.images?.[0]
    ? `<img src="${API_BASE}/${p.images[0]}" alt="${p.name}" loading="lazy">`
    : '<span style="font-size:64px">🧦</span>';

  return `
    <div class="product-card" onclick="location.href='pages/product.html?id=${p.id}'">
      <div class="product-card-img">
        ${img}
        ${p.discount_pct > 0 ? `<span class="badge-sale">-${p.discount_pct}%</span>` : ''}
        ${p.is_featured ? '<span class="badge-featured">Hot</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-cat">${p.category.replace(/-/g,' ')}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-price">
          <span class="price-main">${fmt.price(p.display_price)}</span>
          ${p.original_price ? `<span class="price-old">${fmt.price(p.original_price)}</span>` : ''}
        </div>
      </div>
      <div class="product-card-footer">
        <button class="btn btn-gold btn-sm" style="flex:1" onclick="event.stopPropagation(); quickOrder(${p.id})">Mua ngay</button>
      </div>
    </div>`;
}

// ── Quick order (mua luôn không cần vào trang detail) ──
function quickOrder(productId) {
  location.href = `pages/product.html?id=${productId}`;
}
