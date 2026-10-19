
const { prisma, toCallback } = require('../config/DB');
const orderService = require('./orderService');


function dashboardStats(cb) {
  const work = Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { items: { orderBy: { id: 'asc' } }, user: { select: { username: true } } },
    }),
  ]).then(([revenue, pending, totalOrders, totalProducts, totalUsers, recent]) => ({
    revenue: revenue._sum.total || 0,
    pending,
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders: recent.map(orderService.toView),
  }));
  toCallback(work, cb);
}

module.exports = { dashboardStats };
