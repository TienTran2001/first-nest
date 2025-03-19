# 🚀 NestJS Best Practices

## 📌 Giới Thiệu

Đây là một dự án thực tế sử dụng [NestJS](https://nestjs.com/) - một framework mạnh mẽ cho Node.js, giúp xây dựng các ứng dụng backend hiệu quả, dễ bảo trì, và có khả năng mở rộng cao.

## 📦 Cài Đặt

```bash
yarn install
```

## 🚀 Chạy Ứng Dụng

```bash
yarn start:dev
```

## 📂 Cấu Trúc Dự Án

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── middlewares/
├── config/
│   ├── config.module.ts
│   ├── config.service.ts
├── modules/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
├── main.ts
```

## 🌍 Môi Trường

Tạo file `.env` để cấu hình biến môi trường:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
JWT_SECRET=mysecretkey
```

## 🛠️ Sử Dụng Prisma

Chạy migration để cập nhật schema:

```bash
yarn prisma migrate dev --name init
```

## 📡 API Users

### 🔹 Tạo người dùng

```http
POST /users
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 🔹 Lấy danh sách người dùng

```http
GET /users
```

## 🔥 Best Practices

✅ Sử dụng **DTO** (Data Transfer Object) để validate dữ liệu đầu vào.
✅ Tách biệt **Service Layer** và **Controller**.
✅ Quản lý database bằng **Prisma ORM**.
✅ Sử dụng **ConfigModule** để quản lý cấu hình môi trường.
✅ Viết **Unit Test** và **E2E Test** cho từng module.
✅ Sử dụng **Guards & Interceptors** để kiểm soát luồng dữ liệu.
✅ Log hệ thống với **winston / pino**.

## 🏗️ Triển Khai

Sử dụng Docker để chạy ứng dụng:

```bash
docker-compose up --build
```

## 📝 License

MIT
