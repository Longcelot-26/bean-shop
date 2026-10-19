

(function () {
  const root = document.getElementById('productRoot');
  if (!root) return;
  const pid = root.dataset.pid;
  const stock = parseInt(root.dataset.stock || '1', 10);
  const qtyInput = document.getElementById('qty');

  document.querySelectorAll('[data-qty-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = (parseInt(qtyInput.value || '1', 10) || 1) + parseInt(btn.dataset.qtyStep, 10);
      qtyInput.value = Math.max(1, Math.min(stock, next));
    });
  });

  document.getElementById('buyBtn').addEventListener('click', () => {
    const qty = Math.max(1, Math.min(stock, parseInt(qtyInput.value || '1', 10) || 1));
    addToCart(pid, qty).then(d => {
      if (!d) return;
      showToast('Đã thêm ' + qty + ' sản phẩm vào giỏ');
      document.getElementById('goCartBtn').style.display = 'block';
    });
  });
})();
