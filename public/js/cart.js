

function cartLoginPrompt() {
  document.getElementById('cartItems').innerHTML =
    '<div class="empty-cart"><h3>Vui lòng đăng nhập</h3><p>Bạn cần đăng nhập để xem giỏ hàng</p>' +
    '<a href="/login?next=/cart"><button class="btn-primary">Đăng nhập</button></a></div>';
  document.getElementById('orderSummary').style.display = 'none';
}

function renderCart() {
  fetch('/api/cart')
    .then(r => (r.status === 401 ? null : r.json()))
    .then(cart => {
      if (cart === null) { cartLoginPrompt(); return; }
      const items = document.getElementById('cartItems');
      const summary = document.getElementById('orderSummary');
      if (!cart.length) {
        items.innerHTML =
          '<div class="empty-cart"><h3>Giỏ hàng trống</h3><p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>' +
          '<a href="/products"><button class="btn-primary">Mua sắm ngay</button></a></div>';
        summary.style.display = 'none';
        setBadge(0);
        return;
      }
      let html = '', total = 0;
      cart.forEach(item => {
        total += item.price * item.qty;
        const img = item.imgFile
          ? '<img src="/imgs/' + encodeURIComponent(item.imgFile) + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)" onerror="this.style.display=\'none\'">'
          : '';
        html +=
          '<div class="cart-item">' +
            '<div class="cart-item-img">' + img + '</div>' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-name">' + esc(item.name) + '</div>' +
              '<div class="cart-item-price">' + fmt(item.price) + '</div>' +
              '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">' +
                '<button class="qty-btn" data-act="dec" data-pid="' + esc(item.pid) + '" data-qty="' + item.qty + '">−</button>' +
                '<span style="font-weight:600">' + item.qty + '</span>' +
                '<button class="qty-btn" data-act="inc" data-pid="' + esc(item.pid) + '" data-qty="' + item.qty + '">+</button>' +
                '<span style="font-size:13px;color:var(--text3);margin-left:8px">= ' + fmt(item.price * item.qty) + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="cart-item-remove" data-act="remove" data-pid="' + esc(item.pid) + '">×</button>' +
          '</div>';
      });
      items.innerHTML = html;
      summary.style.display = 'block';
      document.getElementById('subtotal').textContent = fmt(total);
      document.getElementById('discountRow').textContent = '-0đ';
      document.getElementById('total').textContent = fmt(total);
      setBadge(cart.reduce((s, x) => s + x.qty, 0));
    })
    .catch(() => showToast('Không thể tải giỏ hàng', 'error'));
}

function postCart(path, body) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json().then(d => ({ ok: r.ok, d: d })));
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const pid = b.dataset.pid, qty = parseInt(b.dataset.qty || '1', 10);
  if (b.dataset.act === 'remove') {
    postCart('/api/cart/remove', { pid: pid }).then(() => {
      renderCart();
      showToast('Đã xóa khỏi giỏ hàng', 'error');
    });
  } else {
    const next = b.dataset.act === 'inc' ? qty + 1 : qty - 1;
    if (next < 1) return;
    postCart('/api/cart/update', { pid: pid, qty: next }).then(res => {
      if (!res.ok) showToast(res.d.error || 'Có lỗi xảy ra', 'error');
      renderCart();
    });
  }
});

document.addEventListener('DOMContentLoaded', renderCart);
