# Fortress Bank Admin Dashboard

Admin dashboard để quản lý hệ thống Fortress Bank.

## 🚀 Tính năng

### 1. **Authentication**
- Đăng nhập với username/password
- JWT Bearer token authentication
- Auto-redirect khi chưa đăng nhập

### 2. **Account Management (CRUD)**
- ✅ **Read**: Xem danh sách accounts với pagination & sorting
- ✅ **Update**: Cập nhật status account (ACTIVE/LOCKED/CLOSED)
- ✅ **Lock/Unlock**: Khóa và mở khóa tài khoản
- ❌ **Create/Delete**: Chưa implement (theo yêu cầu)

### 3. **Update PIN**
- Form modal để cập nhật PIN của account
- Validation: 4-6 digits, chỉ số
- Yêu cầu: Old PIN, New PIN, Confirm PIN

### 4. **Deposit (Nạp tiền)**
- Form modal để nạp tiền vào account
- Fields: Account Number, Amount, Description
- Validation: Amount > 0

## 📦 Tech Stack

- **React 19** + TypeScript
- **Material-UI (MUI)** - UI components
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 🛠️ Setup & Installation

### 1. Clone và cài đặt dependencies

```bash
cd fortressbank-admin
npm install
```

### 2. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Nội dung `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Chạy Development Server

```bash
npm run dev
```

App sẽ chạy tại: `http://localhost:5173`

## 🔌 Backend API Requirements

Backend phải chạy tại `http://localhost:8000` (Kong Gateway) với các endpoints:

### Authentication
- `POST /auth/login` - Login
  ```json
  Request: { "username": "admin", "password": "password" }
  Response: {
    "data": {
      "access_token": "token",
      "refresh_token": "token",
      "token_type": "Bearer",
      ...
    }
  }
  ```

### Admin Accounts
- `GET /admin/accounts?page=0&size=10&sortBy=createdAt&sortDirection=desc`
- `GET /admin/accounts/{accountId}`
- `PUT /admin/accounts/{accountId}` - Update status
- `PUT /admin/accounts/{accountId}/lock` - Lock account
- `PUT /admin/accounts/{accountId}/unlock` - Unlock account

### Account Operations
- `PUT /accounts/{accountId}/pin` - Update PIN
  ```json
  { "oldPin": "1234", "newPin": "5678" }
  ```

### Transactions
- `POST /transactions/admin/deposit` - Deposit money
  ```json
  {
    "accountNumber": "1234567890",
    "amount": 1000.00,
    "description": "Nạp tiền"
  }
  ```

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── DepositModal.tsx       # Modal nạp tiền
│   ├── ProtectedRoute.tsx     # Route protection
│   └── UpdatePinModal.tsx     # Modal cập nhật PIN
├── config/              # Configuration
│   └── api.ts                 # Axios config, interceptors
├── context/             # React Context
│   └── AuthContext.tsx        # Authentication state
├── pages/               # Page components
│   ├── DashboardPage.tsx      # Main dashboard
│   └── LoginPage.tsx          # Login page
├── services/            # API services
│   ├── accountService.ts      # Account APIs
│   └── authService.ts         # Auth APIs
├── types/               # TypeScript types
│   └── index.ts              # All type definitions
├── App.tsx              # Main app with routes
└── main.tsx             # App entry point
```

## 🎯 Sử dụng

### 1. Đăng nhập
- Truy cập `/login`
- Nhập username và password
- Sau khi đăng nhập thành công, redirect đến `/dashboard`

### 2. Xem danh sách accounts
- Table hiển thị: Account Number, Full Name, Balance, Status, Created At
- Pagination: Chọn số dòng per page
- Sorting: Mặc định sort by Created At desc

### 3. Actions trên mỗi account
Click icon "⋮" (3 dots) để mở menu actions:
- **Update Status**: Thay đổi ACTIVE/LOCKED/CLOSED
- **Lock/Unlock Account**: Khóa hoặc mở khóa
- **Update PIN**: Mở modal cập nhật PIN
- **Deposit**: Mở modal nạp tiền

### 4. Deposit (Global)
- Click button "Deposit" trên header
- Nhập Account Number, Amount, Description
- Submit để nạp tiền

## 🔐 Authentication Flow

1. User login → Backend trả về `access_token`
2. Token được lưu vào `localStorage`
3. Mọi API call sau đó đều attach `Bearer {access_token}` vào header
4. Nếu token expired (401), tự động logout và redirect về `/login`

## 🐛 Troubleshooting

### CORS Error
Đảm bảo backend đã enable CORS cho `http://localhost:5173`

### 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Kiểm tra backend có require authentication cho các endpoint không

### Network Error
- Đảm bảo backend đang chạy tại `http://localhost:8000`
- Kiểm tra VITE_API_BASE_URL trong file .env

## 📝 Notes

- Project sử dụng Material-UI cho UI components
- Tất cả API calls đều có error handling
- Form có validation cơ bản
- Modals tự động đóng sau khi thành công

## 👥 Contact

Nếu có vấn đề, liên hệ team development.
