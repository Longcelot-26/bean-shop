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
- Nạp dữ liệu sản phẩm mẫu hoặc import dữ liệu cũ từ JSON.

## Cấu trúc

```
shop-express/
├── server.js                 # điểm vào: kiểm tra kết nối DB rồi listen
├── app.js                    # dựng app Express (middleware, routes)
├── prisma/
│   ├── schema.prisma         # mô hình dữ liệu (User, Product, CartItem, Order, OrderItem)
│   ├── migrations/           # sinh ra bởi `npm run db:migrate` (nhớ commit lên GitHub)
│   ├── seed.js, seed.json    # sản phẩm mẫu
│   └── legacy.js             # chuyển dữ liệu dạng JSON cũ sang model Prisma
├── prisma.config.js          # cấu hình Prisma CLI (đọc DATABASE_URL từ .env)
├── src/
│   ├── config/index.js       # cấu hình từ .env
│   ├── config/DB.js          # PrismaClient dùng chung + bọc Promise -> callback
│   ├── generated/            # Prisma Client (tự sinh, không commit)
│   ├── routes/ controllers/ services/ middlewares/ utils/
│   └── views/                # template EJS
├── public/                   # CSS + JS phía trình duyệt (URL: /static/...)
├── imgs/                     # ảnh sản phẩm (URL: /imgs/...)
├── scripts/                  # smokeTest.js, importFromJson.js, buildPrismaClient.js
└── deploy/                   # mẫu systemd + nginx
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
psql -U postgres -c "CREATE DATABASE chubbylung_test;"   # DB riêng cho npm test
```

**Bước 3. Điền `.env`** — sửa `DATABASE_URL` / `TEST_DATABASE_URL` cho đúng user, mật khẩu, cổng của bạn.

**Bước 4. Tạo bảng** (lần đầu — sinh thư mục `prisma/migrations/`, nhớ commit)

```bash
npm run db:migrate -- --name init
```

**Bước 5. Nạp dữ liệu**

```bash
npm run db:seed                          # sản phẩm mẫu
npm run db:import -- ./shop_db.json      # hoặc: nhập dữ liệu cũ (xem mục bên dưới)
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
| `npm run db:import -- file.json`   | nhập dữ liệu từ `shop_db.json` cũ                    |
| `npm run db:studio`                | xem/sửa dữ liệu bằng giao diện web                   |
| `npm test`                         | chạy bài test (cần `TEST_DATABASE_URL`)              |

## Nhập dữ liệu từ shop_db.json cũ

```bash
npm run db:import -- ./shop_db.json
```

Giữ nguyên sản phẩm, tài khoản (kể cả mật khẩu băm kiểu Flask — người dùng vẫn đăng nhập được và được nâng cấp lên bcrypt ở lần đầu), giỏ hàng, đơn hàng và lịch sử mua. Dòng giỏ trỏ tới sản phẩm đã xoá hoặc tài khoản không còn sẽ bị bỏ qua và được đếm trong kết quả. Chạy lại nhiều lần không bị nhân đôi.

## Chạy test

```bash
# tạo bảng cho DB test (một lần)
DATABASE_URL="<TEST_DATABASE_URL>" npx prisma migrate deploy
# chạy
npm test
```

Bài test **xoá sạch** DB test mỗi lần chạy, nên từ chối chạy nếu `TEST_DATABASE_URL` thiếu, trùng `DATABASE_URL`, hoặc tên database không có chữ `test`.

## Deploy lên EC2 (Amazon Linux 2023)

```bash
# 1. Cài Node + PostgreSQL (một lần). Prisma 7 cần Node 20.19+ / 22.12+ — kiểm tra bằng `node -v`
sudo dnf install -y nodejs22 postgresql16 postgresql16-server
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# 2. Cho phép đăng nhập bằng mật khẩu qua 127.0.0.1 (mặc định là `ident`)
sudo sed -i 's/^\(host .*\)ident$/\1scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# 3. Tạo user + database
sudo -u postgres psql -c "CREATE USER chubbylung WITH PASSWORD 'mat-khau-manh';"
sudo -u postgres psql -c "CREATE DATABASE chubbylung OWNER chubbylung;"

# 4. Dừng bản cũ, lấy mã nguồn
sudo systemctl stop chubblung
cd ~ && git clone https://github.com/Longcelot-26/bean-shop.git shop-express

# 5. Cài thư viện + cấu hình (repo hiện chưa có package-lock.json)
cd ~/shop-express && npm install --omit=dev
cp .env.example .env && nano .env     # NODE_ENV=production, TRUST_PROXY=1, DATABASE_URL, ADMIN_PASS, SESSION_SECRET

# 6. Tạo bảng + nạp dữ liệu (repo phải có prisma/migrations)
npm run db:deploy
# Tùy chọn: chỉ chạy nếu có file shop_db.json dữ liệu cũ
npm run db:import -- /duong-dan/toi/shop_db.json

# 7. Cập nhật systemd + nginx theo deploy/
sudo cp deploy/chubblung.service /etc/systemd/system/chubblung.service
sudo cp deploy/nginx.conf /etc/nginx/conf.d/chubblung.conf
sudo systemctl daemon-reload && sudo systemctl restart chubblung && sudo nginx -t && sudo systemctl restart nginx
```

Kiểm tra: `sudo systemctl status chubblung`, `journalctl -u chubblung -n 50`, `curl -I http://localhost`.
Cập nhật code sau này: `git pull && npm install --omit=dev && npm run db:deploy && sudo systemctl restart chubblung`.

Mật khẩu DB có ký tự đặc biệt phải mã hoá URL trong `DATABASE_URL`. Nên sao lưu định kỳ: `pg_dump -U chubbylung chubbylung > backup.sql`.
