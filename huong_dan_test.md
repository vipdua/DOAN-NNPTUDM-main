# Hướng Dẫn Setup và Chạy Các Loại Test 

Tài liệu này hướng dẫn bạn cách khởi chạy các bài test chi tiết trong dự án, bao gồm các công cụ: Vitest, Playwright, TestCafe, Cypress và Selenium.

## 1. Chuẩn Bị Database (Trước Khi Test)

Nếu kết nối MongoDB của bạn hiện đang trỏ vào container Docker (ví dụ `mongodb://mongo:27017`), hãy đổi sang localhost trước khi chạy test nội bộ:
1. Mở file `.env` hoặc file config (tuỳ nơi chứa URL kết nối).
2. Sửa link connect thành `mongodb://localhost:27017/...` hoặc `mongodb://127.0.0.1:27017/...`
3. Chạy file seed để khởi tạo dữ liệu mẫu cho database:
   ```bash
   node seeder.js
   ```

---

## 2. Khởi Chạy Hệ Thống (Backend & Frontend)
Trước khi chạy hầu hết các công cụ test (ngoại trừ một số unit test của backend), bạn cần đảm bảo cả Backend và Frontend đều đang hoạt động:

**Chạy Backend:**
1. Mở terminal tại thư mục gốc của dự án.
2. Chạy lệnh:
   ```bash
   npm start
   ```
   *(Backend thường chạy ở cổng `http://localhost:3000` hoặc cổng được chỉ định trong `.env`)*

**Chạy Frontend:**
1. Mở một terminal MỚI, trỏ vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Chạy lệnh tuỳ theo package manager bạn đang sử dụng:
   ```bash
   npm run dev
   ```
   *(Frontend thường sẽ chạy ở cổng `http://localhost:5173` đối với Vite)*

---

## 3. Vitest (Backend Tests)
Dự án được cấu hình chạy Vitest trong backend. Để chạy các bài test backend:
1. Mở terminal và trỏ về thư mục gốc của backend (chứa file `package.json` có từ khoá vitest).
2. Chạy lệnh:
   ```bash
   npm run vitest
   ```

---

## 4. Playwright (E2E Tests)
Các bài test Playwright được đặt trong thư mục `play-wright`.
1. Di chuyển vào thư mục Playwright:
   ```bash
   cd play-wright
   ```
2. Cài đặt các thư viện cần thiết (nếu đây là lần đầu):
   ```bash
   npm install
   npx playwright install
   ```
3. Chạy test Playwright:
   ```bash
   npx playwright test
   ```
   *Để xem báo cáo chi tiết dạng UI, bạn có thể chạy: `npx playwright show-report`*

---

## 5. TestCafe (Frontend E2E Tests)
Thư mục chứa script test của TestCafe nằm ở `frontend/testcafe`.
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Chạy TestCafe bằng lệnh npx (bạn có thể thay `chrome` bằng trình duyệt mong muốn như `edge`, `firefox`):
   ```bash
   npx testcafe chrome testcafe/
   ```

---

## 6. Cypress (Frontend E2E & Component Tests)
Cypress cũng được cài đặt trong môi trường thư mục `frontend`.
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Mở giao diện Cypress (khuyên dùng để kiểm tra trực quan):
   ```bash
   npx cypress open
   ```
3. Hoặc chạy ngầm (headless mode) trong terminal:
   ```bash
   npx cypress run
   ```

---

## 7. Selenium (Automation Tests)
Trang bị các bài test tự động hóa cơ bản viết bằng js/cjs, được lưu trữ trong thư mục `frontend/selenium`.
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Chạy file test trực tiếp thông qua Node.js. Ví dụ chạy test ở giỏ hàng:
   ```bash
   node selenium/cart.test.cjs
   ```
   *(Hãy đảm bảo frontend và backend đều đang hoạt động để Selenium có website tương tác)*
