

document.querySelectorAll('.payment-method').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.payment-method').forEach(x => x.classList.remove('active'));
    el.classList.add('active');
  });
});

fetch('/api/cart')
  .then(r => {
    if (r.status === 401) { window.location = '/login?next=/checkout'; return null; }
    return r.json();
  })
  .then(cart => {
    if (!cart) return;
    if (!cart.length) { window.location = '/cart'; return; }
    let html = '', total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const img = item.imgFile
        ? '<img src="/imgs/' + encodeURIComponent(item.imgFile) + '" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.style.display=\'none\'">'
        : '<div style="width:48px;height:48px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)"></div>';
      html +=
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">' +
          '<div style="display:flex;align-items:center;gap:10px">' + img +
            '<div><div style="font-weight:500">' + esc(item.name) + '</div><div style="color:var(--text3)">x' + item.qty + '</div></div>' +
          '</div>' +
          '<span style="font-weight:600;color:var(--accent)">' + fmt(item.price * item.qty) + '</span>' +
        '</div>';
    });
    document.getElementById('checkoutItems').innerHTML = html;
    document.getElementById('co-sub').textContent = fmt(total);
    document.getElementById('co-total').textContent = fmt(total);
  });
