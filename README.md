# Chubby Lung Shop — Express + Prisma (PostgreSQL)

Web bán thú bông Arknights Dragon Bubbles. Express 5 + EJS, dữ liệu lưu trong **PostgreSQL** qua **Prisma 7**.
Kiến trúc phân lớp: **route → controller → service → Prisma**.

## Công nghệ sử dụng

| Thành phần        | Công nghệ                                        |
| ----------------- | ------------------------------------------------ |
| Runtime           | Node.js, JavaScript                              |
| Backend           | Express 5, kiến trúc route–controller–service    |
| Giao diện         | EJS, CSS, JavaScript phía trình duyệt            |
| Cơ sở dữ liệu     | PostgreSQL, Prisma ORM 7                         |
| Xác thực          | Session cookie, bcryptjs, giới hạn đăng nhập sai |
| Kiểm thử và build | Supertest, smoke test, esbuild                   |

## Tính năng chính

- Xem, tìm kiếm, lọc và sắp xếp sản phẩm; xem thông tin chi tiết, giá và tồn kho.
- Đăng ký, đăng nhập, đăng xuất và quản lý session khách hàng.
- Thêm, cập nhật, xóa sản phẩm trong giỏ; số lượng được kiểm tra theo tồn kho.
- Tạo đơn hàng, xem xác nhận và lịch sử đơn hàng.
- Khu vực quản trị có dashboard, danh sách sản phẩm/đơn hàng/người dùng và cập nhật trạng thái đơn.
- Nạp dữ liệu sản phẩm mẫu.

## Cấu trúc

```
shop-express/
├── server.js                 # điểm vào: kiểm tra kết nối DB rồi listen
├── app.js                    # dựng app Express (middleware, routes)
├── prisma/
│   ├── schema.prisma         # mô hình dữ liệu (User, Product, CartItem, Order, OrderItem)
│   ├── migrations/           # sinh ra bởi `npm run db:migrate`
│   ├── seed.js, seed.json    # sản phẩm mẫu
├── prisma.config.js          # cấu hình Prisma CLI
├── src/
│   ├── config/index.js       # cấu hình từ .env
│   ├── config/DB.js          # PrismaClient dùng chung + bọc Promise -> callback
│   ├── generated/            # Prisma Client (tự sinh, không commit)
│   ├── routes/ controllers/ services/ middlewares/ utils/
│   └── views/                # template EJS
├── public/                   # CSS + JS phía trình duyệt
├── imgs/                     # ảnh sản phẩm
└── scripts/                  # buildPrismaClient.js, importFromJson.js
```

## Cơ sở dữ liệu

| Bảng          | Nội dung      | Ghi chú                                                                   |
| ------------- | ------------- | ------------------------------------------------------------------------- |
| `users`       | tài khoản     | `username` duy nhất, `password_hash` (bcrypt)                             |
| `products`    | sản phẩm      | giữ mã cũ `p001`… để URL không đổi                                        |
| `cart_items`  | giỏ hàng      | duy nhất theo (user, sản phẩm); xoá user/sản phẩm thì xoá theo            |
| `orders`      | đơn hàng      | `status`, `payment` là enum; xoá user thì đơn vẫn giữ (`user_id` = NULL)  |
| `order_items` | dòng đơn hàng | lưu **bản sao** tên/giá/ảnh lúc mua; xoá sản phẩm thì `product_id` = NULL |

## Chạy máy local — từng bước

**Clone repository**

```bash
git clone https://github.com/Longcelot-26/bean-shop.git
cd bean-shop
```

**Bước 1. Cài thư viện** (tự sinh Prisma Client nhờ `postinstall`)

```bash
npm install
```

**Bước 2. Tạo database rỗng trong PostgreSQL**

```bash
psql -U postgres -c "CREATE DATABASE chubbylung;"
```

**Bước 3. Điền `.env`** — sửa `DATABASE_URL` cho đúng user, mật khẩu và cổng của bạn.

**Bước 4. Tạo bảng** (lần đầu — sinh thư mục `prisma/migrations/`)

```bash
npm run db:migrate -- --name init
```

**Bước 5. Nạp dữ liệu**

```bash
npm run db:seed                          # sản phẩm mẫu
```

**Bước 6. Chạy**

```bash
npm run dev        # http://127.0.0.1:5000
```

Mac bị kẹt cổng 5000 (AirPlay Receiver) -> đặt `PORT=8080` trong `.env`.

### Các lệnh

| Lệnh                               | Việc                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| `npm run dev` / `npm start`        | chạy server (dev tự restart khi sửa code)            |
| `npm run db:generate`              | sinh lại Prisma Client (sau khi sửa `schema.prisma`) |
| `npm run db:migrate -- --name tên` | tạo + áp migration (dev)                             |
| `npm run db:deploy`                | áp migration đã có (server thật)                     |
| `npm run db:seed`                  | nạp sản phẩm mẫu (chạy lại không sao)                |
| `npm run db:studio`                | xem/sửa dữ liệu bằng giao diện web                   |
