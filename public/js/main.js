

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function showToast(msg, type) {
  const box = document.getElementById('toastContainer');
  if (!box) return;
  const d = document.createElement('div');
  d.className = 'toast toast-' + (type || 'success');
  d.textContent = msg;
  box.appendChild(d);
  setTimeout(() => {
    d.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => d.remove(), 300);
  }, 3000);
}

function isLoggedIn() {
  return !!document.body.dataset.user;
}

function setBadge(n) {
  document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = n || 0; });
}

function updateCartBadge() {
  if (!isLoggedIn()) return;
  fetch('/api/cart')
    .then(r => (r.ok ? r.json() : []))
    .then(cart => setBadge(Array.isArray(cart) ? cart.reduce((s, x) => s + x.qty, 0) : 0))
    .catch(() => {});
}

function revealProductCards() {
  const cards = document.querySelectorAll('.product-grid .product-card');
  if (!cards.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.classList.remove('reveal-pending');
      card.classList.add('reveal-entering');
      card.addEventListener('animationend', () => card.classList.remove('reveal-entering'), { once: true });
      currentObserver.unobserve(card);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  cards.forEach((card, index) => {
    card.style.setProperty('--product-reveal-delay', `${(index % 4) * 35}ms`);
    card.classList.add('reveal-pending');
    observer.observe(card);
  });
}

function countUpHeroStats() {
  const stats = document.querySelectorAll('.hero-stat-num[data-count]');
  if (!stats.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const group = stats[0].closest('.hero-stats');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      stats.forEach((stat, index) => {
        const target = Number(stat.dataset.count);
        const suffix = stat.dataset.suffix || '';
        window.setTimeout(() => {
          const start = performance.now();
          const duration = 1400;
          const tick = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - ((1 - progress) ** 3);
            stat.textContent = `${progress === 1 ? target : Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, index * 120);
      });
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  observer.observe(group);
}

revealProductCards();
countUpHeroStats();


function addToCart(pid, qty) {
  return fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid: pid, qty: qty || 1 })
  })
    .then(r => {
      if (r.status === 401) {
        showToast('Vui lòng đăng nhập để thêm vào giỏ hàng', 'error');
        setTimeout(() => {
          window.location = '/login?next=' + encodeURIComponent(location.pathname + location.search);
        }, 1200);
        return null;
      }
      return r.json().then(d => ({ ok: r.ok, d: d }));
    })
    .then(res => {
      if (!res) return null;
      if (!res.ok) { showToast(res.d.error || 'Có lỗi xảy ra', 'error'); return null; }
      setBadge(res.d.total_qty);
      return res.d;
    })
    .catch(() => { showToast('Có lỗi xảy ra', 'error'); return null; });
}

function toggleTheme(cb) {
  const dark = cb.checked;
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}


document.addEventListener('click', e => {
  const add = e.target.closest('[data-add-to-cart]');
  if (add) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(add.dataset.pid, 1).then(d => { if (d) showToast('Đã thêm vào giỏ hàng'); });
    return;
  }
  const link = e.target.closest('[data-href]');
  if (link) window.location = link.dataset.href;
}, true);


document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-search]')) {
    window.location = '/products?q=' + encodeURIComponent(e.target.value);
  }
});
document.addEventListener('change', e => {
  if (e.target.matches('[data-sort]')) {
    window.location = '/products?cat=' + encodeURIComponent(e.target.dataset.cat) +
      '&sort=' + encodeURIComponent(e.target.value);
  }
});

document.addEventListener('DOMContentLoaded', updateCartBadge);
