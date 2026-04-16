# BÁO CÁO PHÂN TÍCH HỆ THỐNG
## Hệ Thống Quản Lý Bán Hàng Online

**Tác giả:** Phạm Quốc Trung  
**Mã sinh viên:** 2280616972  
**Ngày hoàn thành:** Tháng 4 năm 2026

---

## I. MỤC LỤC

1. Mô tả tổng quan hệ thống
2. Kiến trúc hệ thống
3. Các chức năng chính
4. Mô tả API Backend
5. Luồng hoạt động chính
6. Các kỹ thuật kiểm thử
7. Phân tích hệ thống quản lý phiên
8. Kết luận

---

## II. MỤC ĐÍCH DỰ ÁN

Dự án này nhằm xây dựng một hệ thống thương mại điện tử (e-commerce) hoàn chỉnh, cho phép người dùng tìm kiếm, xem chi tiết, và mua sắm các sản phẩm trực tuyến. Hệ thống bao gồm hai phần chính:
- **Backend:** Xử lý logic kinh doanh, lưu trữ dữ liệu, xác thực người dùng
- **Frontend:** Cung cấp giao diện người dùng thân thiện, tương tác với backend thông qua API REST

---

## 1. MÔ TẢ TỔNG QUAN HỆ THỐNG

### 1.1 Giới thiệu chung

Hệ thống quản lý bán hàng online (NNPTUD - Ứng Dụng Mua Bán Trực Tuyến) được xây dựng trên nền tảng Node.js + Express cho backend và React cho frontend. Hệ thống hỗ trợ các tính năng cơ bản của một sàn thương mại điện tử hiện đại.

### 1.2 Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản | Mô tả |
|-----------|----------|---------|-------|
| Backend Framework | Express | 4.16.1 | Web framework cho Node.js |
| Frontend Framework | React | 19.2.4 | Library xây dựng UI |
| Build Tool Frontend | Vite | 8.0.4 | Build tool nhanh cho frontend |
| Routing Frontend | React Router | 7.14.0 | Quản lý routing phía client |
| Database | MongoDB | 9.2.4 | NoSQL database |
| ODM | Mongoose | 9.2.4 | Object Document Mapper cho MongoDB |
| Authentication | JWT | 9.0.3 | JSON Web Token |
| Encryption | Bcrypt | 6.0.0 | Mã hóa mật khẩu |
| HTTP Client | Axios | 1.14.0 | Thư viện HTTP cho frontend |
| Server Runtime | Node.js | LTS | JavaScript runtime |
| CORS | CORS | 2.8.6 | Cross-Origin Resource Sharing |
| Validation | Express Validator | 7.3.1 | Validation middleware |

### 1.3 Các tính năng chính

1. **Xác thực người dùng**
   - Đăng ký tài khoản mới
   - Đăng nhập với email/username
   - Đăng xuất
   - Thay đổi mật khẩu
   - Quên mật khẩu (gửi link reset)

2. **Quản lý sản phẩm**
   - Liệt kê tất cả sản phẩm
   - Tìm kiếm sản phẩm theo tiêu đề
   - Lọc sản phẩm theo giá (min/max)
   - Lọc sản phẩm theo danh mục
   - Xem chi tiết sản phẩm
   - Kiểm tra tồn kho

3. **Quản lý danh mục**
   - Liệt kê danh mục
   - Tạo danh mục mới (Admin)
   - Cập nhật danh mục (Admin)
   - Xóa danh mục (Admin)

4. **Giỏ hàng**
   - Thêm sản phẩm vào giỏ
   - Xóa sản phẩm khỏi giỏ
   - Tăng/giảm số lượng sản phẩm
   - Lấy danh sách giỏ hàng

5. **Quản lý người dùng (Admin)**
   - Liệt kê tất cả người dùng
   - Xem chi tiết người dùng
   - Tạo người dùng mới
   - Cập nhật thông tin người dùng
   - Xóa người dùng (soft delete)

6. **Hệ thống phân quyền**
   - **USER:** Người dùng thông thường, xem sản phẩm, mua hàng
   - **MODERATOR:** Có thể xem thông tin người dùng
   - **ADMIN:** Toàn quyền quản lý hệ thống

7. **Bảo mật**
   - Mã hóa mật khẩu bằng Bcrypt (10 rounds)
   - Khóa tài khoản sau 3 lần đăng nhập sai
   - JWT token với thời hạn 24 giờ

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Tổng quan kiến trúc

Hệ thống được xây dựng theo mô hình kiến trúc ba tầng (3-Tier Architecture):

```
┌──────────────────────────────────────┐
│  PRESENTATION LAYER (Frontend)       │
│  React + React Router + Vite         │
│  (UI, Routing, State Management)     │
└──────────────┬───────────────────────┘
               │ HTTP/HTTPS
               │ Axios API Calls
               ↓
┌──────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Backend)      │
│  Express.js + Node.js                │
│  (Routes, Controllers, Middleware)   │
└──────────────┬───────────────────────┘
               │ Mongoose ODM
               │
               ↓
┌──────────────────────────────────────┐
│  DATA LAYER (Database)               │
│  MongoDB                             │
│  (Collections: Users, Products, ...)  │
└──────────────────────────────────────┘
```

**Mô tả:**
- **Presentation Layer:** Giao diện người dùng xây dựng bằng React, sử dụng React Router cho routing client-side
- **Business Logic Layer:** Express.js xử lý các API endpoints, middleware xác thực, phân quyền, validation
- **Data Layer:** MongoDB lưu trữ tất cả dữ liệu, Mongoose cung cấp schema definition và object mapping

### 2.2 Cấu trúc thư mục Backend

```
DOAN-NNPTUDM-main/
├── app.js                    # Cấu hình Express chính
├── package.json              # Dependencies
├── bin/
│   └── www                   # Điểm khởi động server
├── routes/                   # API endpoints
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── products.js          # Product routes
│   ├── categories.js        # Category routes
│   ├── carts.js             # Shopping cart routes
│   ├── messages.js          # Messaging routes
│   ├── roles.js             # Role routes
│   └── index.js             # Main router
├── schemas/                  # MongoDB schemas
│   ├── users.js             # User schema
│   ├── products.js          # Product schema
│   ├── categories.js        # Category schema
│   ├── carts.js             # Cart schema
│   ├── inventories.js       # Inventory schema
│   ├── roles.js             # Role schema
│   └── ...
├── controllers/              # Business logic
│   └── users.js             # User controller
├── utils/                    # Utility functions
│   ├── authHandler.js       # Authentication middleware (CheckLogin, CheckRole)
│   ├── validateHandler.js   # Validation middleware
│   ├── mailHandler.js       # Email sending
│   ├── messageHandler.js    # Message handling
│   ├── idHandler.js         # ID utilities
│   ├── constant.js          # Constants
│   └── data.js              # Data utilities
└── seeder.js                # Database seeding script
```

### 2.3 Cấu trúc thư mục Frontend

```
frontend/
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── index.html               # HTML entry point
├── src/
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   ├── App.css              # Global styles
│   ├── index.css            # CSS index
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Register page
│   │   ├── Products.jsx     # Products listing
│   │   ├── ProductDetail.jsx# Product details
│   │   ├── Cart.jsx         # Shopping cart
│   │   └── admin/           # Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminCategories.jsx
│   │       └── AdminUsers.jsx
│   ├── components/          # Reusable components
│   │   └── AdminRoute.jsx   # Protected route for admin
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.jsx   # Main layout
│   │   └── AdminLayout.jsx  # Admin layout
│   ├── api/                 # API configuration
│   │   └── axios.js         # Axios instance with interceptors
│   └── assets/              # Images, icons, etc.
├── cypress/                 # Cypress tests
│   └── e2e/
│       └── auth.cy.js       # Authentication tests
├── cypress.config.js        # Cypress configuration
├── testcafe/                # TestCafe tests
│   └── category.test.js     # Category tests
├── selenium/                # Selenium tests
│   └── cart.test.cjs        # Cart tests
└── public/                  # Static files
```

### 2.4 Luồng dữ liệu

```
Frontend (React)
    ↓
    Axios HTTP Request
    ↓
Backend (Express)
    ↓
    Middleware (Auth, Validation)
    ↓
    Routes → Controllers
    ↓
    Mongoose ODM
    ↓
MongoDB Database
    ↓
    Query Result
    ↓
    Response JSON
    ↓
Frontend (React)
    ↓
    Update State
    ↓
    Re-render UI
```

---

## 3. CÁC CHỨC NĂNG CHÍNH

### 3.1 Chức năng xác thực (Authentication)

Hệ thống xác thực được thực hiện thông qua JWT (JSON Web Token). Khi người dùng đăng nhập thành công, hệ thống sẽ trả về token được lưu trong localStorage.

#### 3.1.1 Chi tiết các API xác thực

| API | Phương thức | Quyền hạn | Mô tả |
|-----|-----------|---------|-------|
| `/api/v1/auth/register` | POST | Công khai | Đăng ký tài khoản mới |
| `/api/v1/auth/login` | POST | Công khai | Đăng nhập |
| `/api/v1/auth/me` | GET | Đã đăng nhập | Lấy thông tin user hiện tại |
| `/api/v1/auth/logout` | POST | Đã đăng nhập | Đăng xuất |
| `/api/v1/auth/changepassword` | POST | Đã đăng nhập | Thay đổi mật khẩu |
| `/api/v1/auth/forgotpassword` | POST | Công khai | Gửi link reset password |

#### 3.1.2 Luồng xác thực

1. **Register (Đăng ký)**
   - Người dùng nhập username, email, password
   - Backend kiểm tra email/username không trùng
   - Mật khẩu được hash bằng bcrypt
   - Tạo user mới với role = "USER"
   - Tự động tạo giỏ hàng cho user

2. **Login (Đăng nhập)**
   - Người dùng nhập username/email + password
   - Backend kiểm tra username có tồn tại
   - So sánh password bằng bcrypt.compareSync()
   - Nếu đúng, tạo JWT token (thời hạn 24h)
   - Lưu token vào cookie + localStorage
   - Điều hướng dựa trên role (Admin → /admin/dashboard)

3. **Logout (Đăng xuất)**
   - Xóa token từ cookie và localStorage
   - Người dùng không thể truy cập protected routes

### 3.2 Quản lý sản phẩm (Product Management)

Cho phép xem danh sách sản phẩm, tìm kiếm, lọc theo giá, và xem chi tiết sản phẩm.

#### 3.2.1 Chi tiết các API sản phẩm

| API | Phương thức | Quyền hạn | Mô tả |
|-----|-----------|---------|-------|
| `/api/v1/products` | GET | Công khai | Liệt kê sản phẩm, hỗ trợ filter |
| `/api/v1/products/:id` | GET | Công khai | Xem chi tiết sản phẩm + tồn kho |
| `/api/v1/products` | POST | Admin | Tạo sản phẩm mới |
| `/api/v1/products/:id` | PUT | Admin | Cập nhật sản phẩm |
| `/api/v1/products/:id` | DELETE | Admin | Xóa sản phẩm (soft delete) |

#### 3.2.2 Query parameters cho GET /products

- `title`: Tìm kiếm theo tiêu đề (regex, case-insensitive)
- `minprice`: Giá tối thiểu (default: 0)
- `maxprice`: Giá tối đa (default: Number.MAX_SAFE_INTEGER)
- `category`: Lọc theo ID danh mục

**Ví dụ:** 
```
GET /api/v1/products?title=iphone&minprice=500&maxprice=1500&category=507f1f77bcf86cd799439011
```

#### 3.2.3 Tồn kho (Inventory)

- Mỗi sản phẩm có bản ghi tồn kho riêng
- Khi tạo sản phẩm mới, tự động tạo record inventory
- Thông tin tồn kho không được cập nhật khi thêm vào giỏ (chỉ kiểm tra)
- Trong tương lai có thể cập nhật tồn kho khi checkout

### 3.3 Quản lý danh mục (Category Management)

Các sản phẩm được phân loại theo danh mục. Admin có thể tạo, chỉnh sửa, xóa danh mục.

#### 3.3.1 Chi tiết API danh mục

| API | Phương thức | Quyền hạn | Mô tả |
|-----|-----------|---------|-------|
| `/api/v1/categories` | GET | Công khai | Liệt kê danh mục |
| `/api/v1/categories/:id` | GET | Công khai | Chi tiết danh mục |
| `/api/v1/categories` | POST | Admin | Tạo danh mục |
| `/api/v1/categories/:id` | PUT | Admin | Cập nhật danh mục |
| `/api/v1/categories/:id` | DELETE | Admin | Xóa danh mục |

### 3.4 Giỏ hàng (Shopping Cart)

Người dùng có thể thêm, xóa, tăng/giảm số lượng sản phẩm trong giỏ hàng. Hệ thống kiểm tra tồn kho trước khi cho phép cập nhật.

#### 3.4.1 Chi tiết API giỏ hàng

| API | Phương thức | Mô tả | Kiểm tra TK |
|-----|-----------|-------|-----------|
| `/api/v1/carts` | GET | Lấy giỏ hàng của user | N/A |
| `/api/v1/carts/add` | POST | Thêm/tăng sản phẩm | Có |
| `/api/v1/carts/remove` | POST | Xóa sản phẩm | Có |
| `/api/v1/carts/decrease` | POST | Giảm số lượng | Có |

#### 3.4.2 Logic thêm vào giỏ

```javascript
1. Tìm giỏ hàng của user
2. Tìm sản phẩm trong giỏ
3. Nếu chưa có:
   - Kiểm tra stock >= 1
   - Thêm product mới với quantity = 1
4. Nếu đã có:
   - Kiểm tra stock >= (quantity + 1)
   - Tăng quantity lên 1
5. Lưu giỏ hàng
```

#### 3.4.3 Quản lý người dùng (Admin)

| API | Phương thức | Quyền hạn | Mô tả |
|-----|-----------|---------|-------|
| `/api/v1/users` | GET | Admin | Liệt kê tất cả user |
| `/api/v1/users/:id` | GET | Admin, Moderator | Chi tiết user |
| `/api/v1/users` | POST | Admin | Tạo user mới |
| `/api/v1/users/:id` | PUT | Admin | Cập nhật user |
| `/api/v1/users/:id` | DELETE | Admin | Xóa user (soft delete) |

---

## 4. MÔ TẢ API BACKEND

### 4.1 Base URL
```
http://localhost:3000/api/v1
```

### 4.2 Authentication API (/auth)

#### 4.2.1 Register (POST /auth/register)
```json
Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPassword123!"
}

Response (201):
{
  "message": "Dang ky thanh cong",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "USER"
    }
  }
}
```

#### 4.2.2 Login (POST /auth/login)
```json
Request Body:
{
  "username": "john_doe",
  "password": "StrongPassword123!"
}

Response (200):
{
  "message": "Dang nhap thanh cong",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": {
      "name": "USER"
    }
  }
}
```

#### 4.2.3 Get Current User (GET /auth/me)
```
Request Header:
Authorization: Bearer <token>

Response (200):
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "role": { "name": "USER" }
}
```

### 4.3 Products API (/products)

#### 4.3.1 Get All Products (GET /products)
```
Query Parameters:
- title: String (optional) - Tìm kiếm theo tiêu đề
- minprice: Number (optional) - Giá tối thiểu
- maxprice: Number (optional) - Giá tối đa
- category: ObjectId (optional) - ID danh mục

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "title": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "price": 999,
    "description": "Flagship smartphone...",
    "images": ["https://..."],
    "category": {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Electronics",
      "slug": "electronics"
    },
    "createdAt": "2024-04-15T10:00:00Z",
    "updatedAt": "2024-04-15T10:00:00Z"
  }
]
```

#### 4.3.2 Get Product Detail (GET /products/:id)
```
Response (200):
{
  "product": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "price": 999,
    "description": "Flagship smartphone...",
    "images": ["https://..."],
    "category": { "name": "Electronics", "slug": "electronics" }
  },
  "inventory": {
    "_id": "507f1f77bcf86cd799439030",
    "product": "507f1f77bcf86cd799439020",
    "stock": 50
  }
}
```

#### 4.3.3 Create Product (POST /products) - Admin Only
```json
Request:
{
  "title": "iPhone 15 Pro",
  "price": 999,
  "description": "Flagship smartphone",
  "images": ["https://..."],
  "category": "507f1f77bcf86cd799439021",
  "stock": 100
}

Response (201):
{
  "product": { ... },
  "inventory": { "stock": 100 }
}
```

### 4.4 Shopping Cart API (/carts)

#### 4.4.1 Get Cart (GET /carts)
```
Response (200):
[
  {
    "product": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "iPhone 15 Pro",
      "price": 999,
      "images": ["https://..."]
    },
    "quantity": 2
  },
  {
    "product": {
      "_id": "507f1f77bcf86cd799439021",
      "title": "Samsung Galaxy S24",
      "price": 899,
      "images": ["https://..."]
    },
    "quantity": 1
  }
]
```

#### 4.4.2 Add to Cart (POST /carts/add)
```json
Request:
{
  "product": "507f1f77bcf86cd799439020"
}

Response (200):
{
  "user": "507f1f77bcf86cd799439011",
  "products": [
    {
      "product": "507f1f77bcf86cd799439020",
      "quantity": 3
    }
  ]
}
```

#### 4.4.3 Remove from Cart (POST /carts/remove)
```json
Request:
{
  "product": "507f1f77bcf86cd799439020"
}

Response (200):
{
  "user": "507f1f77bcf86cd799439011",
  "products": [
    {
      "product": "507f1f77bcf86cd799439021",
      "quantity": 1
    }
  ]
}
```

### 4.5 Users API (/users)

#### 4.5.1 Get All Users (GET /users) - Admin Only
```
Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": { "name": "USER" },
    "status": true,
    "createdAt": "2024-04-15T10:00:00Z"
  }
]
```

#### 4.5.2 Update User (PUT /users/:id) - Admin Only
```json
Request:
{
  "fullName": "John Smith",
  "status": true,
  "role": "507f1f77bcf86cd799439012"
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Smith",
  "status": true
}
```

#### 4.5.3 Delete User (DELETE /users/:id) - Admin Only
```
Response (200):
{
  "message": "Xoa user thanh cong",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "isDeleted": true
  }
}
```

---

## 5. LUỒNG HOẠT ĐỘNG CHÍNH

### 5.1 Luồng đăng nhập (Login Flow)

```
┌─────────────────────────────────────────────────────────┐
│                   Start: User Login                      │
└─────────────────────┬───────────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │ Người dùng nhập email + pwd │
        └─────────────┬───────────────┘
                      ↓
        ┌────────────────────────────────────┐
        │ Frontend: POST /api/v1/auth/login  │
        └─────────────┬──────────────────────┘
                      ↓
        ┌────────────────────────────────────┐
        │ Backend: Kiểm tra username tồn tại │
        └─────────────┬──────────────────────┘
                      ↓
                ┌─────────┴─────────┐
                ↓                   ↓
           ✓ Tồn tại           ✗ Không tồn tại
                ↓                   ↓
        ┌───────────────────┐  ┌──────────────────┐
        │ So sánh password  │  │ Response 401:    │
        │ bằng bcrypt       │  │ "Username/Pwd    │
        └────────┬──────────┘  │ sai"             │
                 ↓              └──────────────────┘
          ┌──────┴──────┐
          ↓             ↓
       ✓ Đúng      ✗ Sai
          ↓             ↓
    ┌─────────────┐ ┌─────────────────┐
    │ Reset login │ │ Tăng loginCount │
    │ Count       │ │ Nếu >= 3 → khóa │
    └──────┬──────┘ └─────────────────┘
           ↓
    ┌────────────────┐
    │ Tạo JWT Token  │
    │ (24h timeout)  │
    └────────┬───────┘
             ↓
    ┌──────────────────────┐
    │ Lưu token:           │
    │ - localStorage       │
    │ - Cookie (httpOnly)  │
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │ Check Role:          │
    │ Admin → /admin/dash  │
    │ User → /             │
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │ Response 200 + Token │
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │ Frontend: Lưu token  │
    │ Điều hướng trang     │
    └────────┬─────────────┘
             ↓
    ┌──────────────────┐
    │ Login Thành Công │
    └──────────────────┘
```

### 5.2 Luồng mua hàng (Shopping Flow)

```
START: Khách hàng vào website
    ↓
┌────────────────────────────────────┐
│ Xem danh sách sản phẩm (GET /api/v1/products)
└────────────────────┬───────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ Lọc / Tìm kiếm sản phẩm:    │
        │ - Theo tiêu đề              │
        │ - Theo giá (min/max)        │
        │ - Theo danh mục             │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │ Click vào sản phẩm              │
        │ GET /api/v1/products/:id        │
        │ (lấy chi tiết + tồn kho)        │
        └────────────┬────────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │ Xem thông tin:                  │
        │ - Tiêu đề, giá, hình ảnh        │
        │ - Mô tả sản phẩm                │
        │ - Tồn kho hiện tại              │
        └────────────┬────────────────────┘
                     ↓
        ┌────────────────────────────┐
        │ {Quyết định mua?}          │
        └───────┬──────────┬─────────┘
                │          │
             YES│          │NO
                ↓          ↓
        ┌──────────────┐  ┌────────────┐
        │ Thêm vào giỏ │  │ Tiếp tục   │
        │ POST /carts/add │ xem sản    │
        └────┬─────────┘  │ phẩm khác  │
             ↓             └────────────┘
        ┌──────────────────────────────┐   ↑
        │ Backend: Kiểm tra tồn kho    │───┘
        └─────────┬────────────────────┘
                  ↓
          ┌───────┴────────┐
          ↓                ↓
      Đủ TK          Không đủ TK
          ↓                ↓
    ┌─────────────┐ ┌─────────────────┐
    │ Thêm vào    │ │ Response 404:   │
    │ giỏ hàng    │ │ "Tồn kho không  │
    └──────┬──────┘ │ đủ"             │
           ↓        └─────────────────┘
    ┌──────────────────┐
    │ Response giỏ hàng│
    │ (tất cả sản phẩm)│
    └──────┬───────────┘
           ↓
    ┌──────────────────────────────────┐
    │ Frontend: Cập nhật giỏ hàng UI   │
    │ Hiển thị số lượng sản phẩm       │
    └──────┬───────────────────────────┘
           ↓
    ┌──────────────────┐
    │ {Xem giỏ hàng?}  │
    └─────┬────────┬──┘
          │YES     │NO
          ↓        └───────────┐
    ┌──────────────┐      Quay lại
    │ Xem giỏ hàng │    danh sách SP
    │ GET /carts   │   (top loop)
    └─────┬────────┘
          ↓
    ┌──────────────────────┐
    │ Hiển thị sản phẩm    │
    │ trong giỏ            │
    └─────┬────────────────┘
          ↓
    ┌──────────────────────┐
    │ Có thể:              │
    │ - Tăng số lượng      │
    │ - Giảm số lượng      │
    │ - Xóa sản phẩm       │
    └─────┬────────────────┘
          ↓
    ┌──────────────────────┐
    │ Tính tổng tiền       │
    │ ∑ (price × qty)      │
    └─────┬────────────────┘
          ↓
    ┌──────────────────────────┐
    │ Nút "Thanh toán"        │
    │ (Chức năng chuẩn bị)    │
    └──────────────────────────┘
```

### 5.3 Chi tiết từng bước

#### Bước 1-3: Xem sản phẩm
- Frontend gọi API: `GET /api/v1/products`
- Backend trả về danh sách tất cả sản phẩm
- Frontend render danh sách với hình ảnh, tiêu đề, giá

#### Bước 4-7: Lọc / Tìm kiếm
- Người dùng nhập tiêu đề hoặc chọn giá
- Frontend gọi API với query parameters
- Ví dụ: `GET /api/v1/products?title=iphone&minprice=500&maxprice=1500`

#### Bước 8-10: Xem chi tiết sản phẩm
- Click vào sản phẩm
- Frontend gọi: `GET /api/v1/products/:id`
- Backend trả about chi tiết + tồn kho

#### Bước 11-15: Thêm vào giỏ
- Click nút "Thêm vào giỏ"
- Frontend gọi: `POST /api/v1/carts/add` với `{product: id}`
- Backend kiểm tra:
  - Giỏ có chứa sản phẩm không?
  - Tồn kho có đủ không?
- Nếu OK: thêm/tăng quantity
- Trả về giỏ hàng cập nhật

#### Bước 16-20: Xem giỏ hàng
- Click vào "Giỏ hàng"
- Frontend gọi: `GET /api/v1/carts`
- Backend trả về marray products với quantity
- Hiển thị từng sản phẩm, có nút tăng/giảm/xóa

---

## 6. CÁC KỸ THUẬT KIỂM THỬ

### 6.1 Tổng quan

Dự án sử dụng **3 công cụ kiểm thử tự động** để đảm bảo chất lượng:

1. **Cypress** - E2E testing
2. **TestCafe** - E2E testing
3. **Selenium WebDriver** - E2E testing

| Công cụ | Loại | Browser | Ưu điểm | Nhược điểm |
|---------|------|---------|-------|-----------|
| Cypress | E2E | Chrome, Firefox, Edge | Nhanh, debug tốt, Quyền truy cập DOM | Chỉ test web |
| TestCafe | E2E | Chrome, Firefox, Safari, Edge | Không cần WebDriver, hỗ trợ mobile | Chậm hơn Cypress |
| Selenium | E2E | Tất cả browser | Hỗ trợ tất cả nền tảng, đa ngôn ngữ | Phức tạp setup, chậm |

### 6.2 Cypress Testing

#### 6.2.1 Giới thiệu
- **Framework:** Mocha (BDD)
- **Location:** `frontend/cypress/e2e/auth.cy.js`
- **Phiên bản:** 15.13.1
- **Cách chạy:** `npx cypress open` hoặc `npx cypress run`

#### 6.2.2 Đặc điểm
- API rõ ràng, dễ viết test
- Cho phép inspect code, network requests trực tiếp
- Hỗ trợ screenshots/videos tự động
- Time-travel debugging

#### 6.2.3 Test Cases (từ auth.cy.js)

**Test Group: AUTH - LOGIN TEST (USERNAME)**

```javascript
describe('AUTH - LOGIN TEST (USERNAME)', () => {
  const username = 'admin';
  const password = 'Long123@';

  beforeEach(() => {
    cy.visit('/login');  // Trước mỗi test, vào trang login
  });
```

| TC ID | Test Name | Input | Expected Output |
|-------|-----------|-------|-----------------|
| TC01 | Login thành công | username: admin, pwd: Long123@ | URL → /admin/dashboard |
| TC02 | Sai username | username: saiuser, pwd: Long123@ | Hiển thị lỗi "Tên đăng nhập hoặc mật khẩu sai" |
| TC03 | Sai password | username: admin, pwd: sai123 | Hiển thị lỗi "Tên đăng nhập hoặc mật khẩu sai" |
| TC04 | Bỏ trống form | (empty) | HTML5 validation: 2 input invalid |
| TC05 | Password cực ngắn | username: admin, pwd: 1 | Lỗi "Tên đăng nhập hoặc mật khẩu sai" |
| TC06 | Username chỉ khoảng trắng | username: (spaces), pwd: Long123@ | Lỗi xác thực |

#### 6.2.4 Kỹ thuật test dùng trong Cypress

1. **Equivalence Partitioning (Phân vùng tương đương)**
   - Chia input thành các nhóm có hành vi giống nhau
   - VD: Username hợp lệ / không hợp lệ / trống
   - Test một case từ mỗi nhóm

2. **Boundary Value Testing (Kiểm thử giá trị biên)**
   - Test tại biên của miền input
   - VD: Password cực ngắn (1 ký tự), email trống
   - Test giá trị nhỏ nhất, lớn nhất

3. **Positive Testing (Test hợp lệ)**
   - Test với dữ liệu hợp lệ
   - Mong đợi kết quả thành công

4. **Negative Testing (Test không hợp lệ)**
   - Test với dữ liệu không hợp lệ
   - Mong đợi lỗi xác thích

### 6.3 TestCafe Framework

#### 6.3.1 Giới thiệu
- **Location:** `frontend/testcafe/category.test.js`
- **Phiên bản:** 3.7.4
- **Đặc điểm:** Là code-free, hỗ trợ remote testing
- **Cách chạy:** `testcafe chrome testcafe/category.test.js`

#### 6.3.2 Ưu điểm
- Không cần WebDriver setup
- Chạy trên nhiều browser: Chrome, Firefox, Safari, Edge
- Hỗ trợ parallel testing
- Hỗ trợ video recording

### 6.4 Selenium WebDriver

#### 6.4.1 Giới thiệu
- **Location:** `frontend/selenium/cart.test.cjs`
- **Phiên bản:** 4.43.0
- **Driver:** ChromeDriver
- **Ngôn ngữ:** JavaScript (Node.js)
- **Cách chạy:** `node selenium/cart.test.cjs`

#### 6.4.2 Đặc điểm
- Độc lập, không phụ thuộc vào browser
- Hỗ trợ tất cả browser: Chrome, Firefox, Safari, IE, Edge
- Hỗ trợ di động (Appium)
- Cấp độ điều khiển thấp, linh hoạt

### 6.5 Tóm tắt Kỹ thuật Test

| Kỹ thuật | Mô tả | VD |
|---------|-------|-----|
| Equivalence Partitioning | Chia input thành nhóm tương đương | Test login: valid/invalid/empty username |
| Boundary Value | Test tại biên miền | Password 1 ký tự, 100 ký tự |
| Positive Testing | Test với dữ liệu hợp lệ | Login với credentials đúng |
| Negative Testing | Test với dữ liệu sai | Login với password sai |
| Exploratory Testing | Explore app tìm bugs | Thay đổi URL, xóa token từ console... |

---

## 7. PHÂN TÍCH HỆ THỐNG QUẢN LÝ PHIÊN (SESSION)

### 7.1 Xác thực người dùng (Authentication)

#### 7.1.1 Cơ chế JWT

```
JWT Token Format:
Header.Payload.Signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "user_id",
  "iat": 1234567890,    // issued at
  "exp": 1234654290     // expires at (24 giờ sau)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  'secret'
)
```

#### 7.1.2 Luồng xác thực

```
┌─────────────────────────────────┐
│ Frontend: POST /auth/login      │
└────────┬────────────────────────┘
         ↓
    ┌──────────────────────────────┐
    │ Backend: Xác thực & Tạo JWT  │
    │ jwt.sign({id: user._id},     │
    │         'secret',            │
    │         {expiresIn: '24h'})   │
    └────────┬─────────────────────┘
             ↓
    ┌──────────────────────────────┐
    │ Lưu token:                   │
    │ - localStorage (browser)     │
    │ - Cookie (httpOnly, secure)  │
    └────────┬─────────────────────┘
             ↓
    ┌──────────────────────────────┐
    │ Mỗi request gửi token:       │
    │ Authorization: Bearer <token>│
    │ hoặc Cookie: NNPTUD_S4=...   │
    └────────┬─────────────────────┘
             ↓
    ┌──────────────────────────────┐
    │ Backend: Verify token        │
    │ jwt.verify(token, 'secret')  │
    │ → Lấy user ID từ payload     │
    └────────┬─────────────────────┘
             ↓
    ┌──────────────────────────────┐
    │ Nếu hợp lệ:                  │
    │ req.user = {id, ...}         │
    │ Tiếp tục xử lý request       │
    │                              │
    │ Nếu hết hạn / không valid:   │
    │ Response 401 Unauthorized    │
    └──────────────────────────────┘
```

### 7.2 Phân quyền (Authorization)

#### 7.2.1 Middleware CheckRole

```javascript
// Backend: utils/authHandler.js
const CheckRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('Not authenticated');
    }
    
    const userRole = req.user.role.name;
    if (roles.includes(userRole)) {
      next();  // User có quyền
    } else {
      res.status(403).send('Forbidden');  // Không có quyền
    }
  };
};
```

#### 7.2.2 Roles trong hệ thống

| Role | Quyền hạn |
|------|----------|
| **ADMIN** | - Xem/tạo/sửa/xóa users<br>- Xem/tạo/sửa/xóa products<br>- Xem/tạo/sửa/xóa categories<br>- Truy cập admin panel |
| **MODERATOR** | - Xem danh sách users<br>- Xem chi tiết users<br>- Xem sản phẩm |
| **USER** | - Xem sản phẩm<br>- Quản lý giỏ hàng<br>- Mua hàng |

### 7.3 Bảo vệ mật khẩu

#### 7.3.1 Mã hóa Bcrypt

```
Bcrypt Hashing Process:

1. User nhập: "MyPassword123"
2. Salt generation: genSaltSync(10)
   → Tạo salt ngẫu nhiên (độ công suất 10)
3. Hash creation: hashSync(password, salt)
   → $2b$10$abcdef... (60 ký tự)
4. Lưu vào database (không lưu password gốc)

Khi Login - Verification:
1. User nhập: "MyPassword123"
2. Lấy hash từ database
3. bcrypt.compareSync("MyPassword123", hash_từ_db)
   → return boolean (true/false)
```

#### 7.3.2 Khóa tài khoản

```javascript
// Sau 3 lần đăng nhập sai
if (user.loginCount >= 3) {
  user.lockTime = Date.now() + 3600 * 1000;  // Khóa 1 giờ
}

// Check khóa
if (user.lockTime && user.lockTime > Date.now()) {
  return res.status(403).send('Tài khoản bị khóa...');
}
```

### 7.4 Middleware Authorization

#### 7.4.1 CheckLogin Middleware

```javascript
// routes/carts.js
router.post('/add', CheckLogin, async (req, res) => {
  let user = req.user;  // req.user được set bởi CheckLogin
  // ... xử lý logic
});
```

#### 7.4.2 CheckRole Middleware

```javascript
// routes/users.js
router.get("/", CheckLogin, CheckRole("ADMIN"), async (req, res) => {
  // Chỉ ADMIN mới có thể xem tất cả users
});

router.get("/:id", CheckLogin, CheckRole("ADMIN", "MODERATOR"), async (req, res) => {
  // ADMIN hoặc MODERATOR mới có thể xem chi tiết user
});
```

---

## 8. MÔ TẢ CÁC SCHEMA DATABASE

### 8.1 User Schema

```javascript
userSchema = {
  _id: ObjectId,
  username: String (unique, required),
  password: String (hashed by bcrypt),
  email: String (unique, required),
  fullName: String (optional),
  avatarUrl: String (default URL),
  status: Boolean (active/inactive),
  role: ObjectId (ref: Role),
  loginCount: Number (0 khi login thành công),
  isDeleted: Boolean (soft delete),
  lockTime: Date (khi bị khóa),
  forgotPasswordToken: String,
  forgotPasswordTokenExp: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Ví dụ document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "admin",
  "password": "$2b$10$...(bcrypt hash)...",
  "email": "admin@example.com",
  "fullName": "Administrator",
  "role": ObjectId("507f1f77bcf86cd799439012"),
  "status": true,
  "isDeleted": false,
  "loginCount": 0,
  "createdAt": ISODate("2024-04-15T10:00:00Z"),
  "updatedAt": ISODate("2024-04-15T10:00:00Z")
}
```

### 8.2 Product Schema

```javascript
productSchema = {
  _id: ObjectId,
  title: String (unique, required),
  slug: String (unique, for SEO),
  price: Number (>= 0),
  description: String,
  images: [String] (mảng URLs),
  category: ObjectId (ref: Category),
  isDeleted: Boolean (soft delete),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 8.3 Cart Schema

```javascript
cartSchema = {
  _id: ObjectId,
  user: ObjectId (ref: User, unique),
  products: [
    {
      product: ObjectId (ref: Product),
      quantity: Number (>= 1),
      _id: false  // không tạo _id cho subdocument
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 8.4 Inventory Schema

```javascript
inventorySchema = {
  _id: ObjectId,
  product: ObjectId (ref: Product, unique),
  stock: Number (số lượng tồn kho),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 8.5 Category Schema

```javascript
categorySchema = {
  _id: ObjectId,
  name: String (unique),
  slug: String (unique),
  description: String,
  isDeleted: Boolean (soft delete),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 8.6 Role Schema

```javascript
roleSchema = {
  _id: ObjectId,
  name: String (unique) - "USER", "MODERATOR", "ADMIN",
  description: String,
  isDeleted: Boolean (soft delete),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 8.7 Quan hệ giữa các Collections

```
Users ──┬─→ Roles (many-to-one)
        │
        ├─→ Carts (one-to-one)
        │
        └─→ Orders (one-to-many, future)

Carts ──→ Products (many-to-many thông qua subdocument)
        → Users (one-to-one)

Products ──→ Categories (many-to-one)
          ──→ Inventories (one-to-one)

Orders (future) ──→ Products (many-to-many)
                 ──→ Users (many-to-one)
```

---

## 9. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 9.1 Yêu cầu hệ thống

- **Node.js:** v14+ (khuyên dùng v18+)
- **MongoDB:** v4.0+ (local hoặc cloud)
- **npm:** v6+
- **Browser:** Chrome, Firefox, Safari, Edge

### 9.2 Cài đặt Backend

```bash
# 1. Clone project
git clone https://github.com/your-repo/DOAN-NNPTUDM.git
cd DOAN-NNPTUDM-main

# 2. Cài đặt dependencies
npm install

# 3. Khởi động MongoDB (nếu chạy local)
mongod

# 4. Chạy seeder để tạo dữ liệu ban đầu
node seeder.js

# 5. Khởi động server
npm start

# Server sẽ chạy tại: http://localhost:3000
```

**Tài khoản Admin mặc định (từ seeder):**
- Username: `admin`
- Password: `Long123@`

### 9.3 Cài đặt Frontend

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình API URL (nếu cần)
# Mở: src/api/axios.js
# Kiểm tra baseURL trỏ đúng backend

# 4. Chạy dev server
npm run dev

# Frontend sẽ chạy tại: http://localhost:5173
```

### 9.4 Chạy các Test

#### 9.4.1 Cypress Tests

```bash
cd frontend

# Cách 1: Mở Cypress GUI
npx cypress open
# - Chọn "E2E Testing"
# - Chọn browser (Chrome/Firefox)
# - Click vào "auth.cy.js"

# Cách 2: Chạy headless
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

#### 9.4.2 TestCafe Tests

```bash
cd frontend

# Chạy tất cả test
testcafe chrome testcafe/

# Chạy test cụ thể
testcafe chrome testcafe/category.test.js

# Chạy trên Firefox
testcafe firefox testcafe/category.test.js
```

#### 9.4.3 Selenium Tests

```bash
cd frontend

# Chạy selenium test
node selenium/cart.test.cjs

# Yêu cầu: ChromeDriver phải cài sẵn
# hoặc: npm install chromedriver (đã có trong package.json)
```

### 9.5 Build cho Production

#### Frontend

```bash
cd frontend
npm run build

# Output: dist/ folder (upload lên hosting)
```

#### Backend

```bash
# Backend không cần build, chỉ cần dependencies
npm install --production
npm start
```

---

## 10. NHỮNG ĐIỂM NỔI BẬT

1. ✅ **Kiến trúc rõ ràng:** 3-tier architecture dễ bảo trì
2. ✅ **Xác thực an toàn:** JWT + Bcrypt 10 rounds
3. ✅ **Phân quyền linh hoạt:** 3 roles (User, Moderator, Admin)
4. ✅ **Kiểm thử toàn diện:** 3 framework (Cypress, TestCafe, Selenium)
5. ✅ **Quản lý tồn kho:** Kiểm tra stock trước khi thêm vào giỏ
6. ✅ **Soft delete:** Bảo toàn dữ liệu lịch sử
7. ✅ **Khóa tài khoản:** Chống brute-force attack
8. ✅ **API RESTful:** Follows REST principles

---

## 11. NHỮNG ĐIỂM CÓ THỂ CẢI THIỆN

1. ❌ **Thanh toán online:** Chưa integrate Stripe/PayPal
2. ❌ **Review sản phẩm:** Chưa có chức năng đánh giá
3. ❌ **Wishlist:** Chưa có chức năng yêu thích
4. ❌ **Email verification:** Chưa verify email khi register
5. ❌ **Caching:** Chưa sử dụng Redis cache
6. ❌ **Rate limiting:** Chưa ngăn chặn DDoS
7. ❌ **Unit tests backend:** Chỉ có E2E tests
8. ❌ **Logging:** Chưa có structured logging
9. ❌ **API documentation:** Chưa có Swagger/OpenAPI docs
10. ❌ **Search nâng cao:** Chỉ search text đơn giản

---

## 12. KẾT LUẬN

Dự án **Hệ Thống Quản Lý Bán Hàng Online** đã xây dựng thành công một ứng dụng thương mại điện tử với:

- ✅ Kiến trúc hệ thống rõ ràng và khoa học
- ✅ Các chức năng e-commerce cơ bản hoàn chỉnh
- ✅ Xác thực & phân quyền bảo mật
- ✅ Kiểm thử thường xuyên với 3 framework
- ✅ Database schema hợp lý và tối ưu
- ✅ RESTful API design đúng chuẩn

Dự án có **tiềm năng phát triển cao** thêm các tính năng nâng cao như thanh toán online, review sản phẩm, wishlist, search nâng cao, để trở thành một **nền tảng thương mại điện tử chuyên nghiệp**. Codebase được viết rõ ràng, dễ bảo trì và mở rộng cho các phát triển tương lai.

---

**Ngày hoàn thành:** Tháng 4 năm 2026  
**Tác giả:** Phạm Quốc Trung  
**Mã SV:** 2280616972

---

*Báo cáo này được tạo tự động từ phân tích source code dự án.*
