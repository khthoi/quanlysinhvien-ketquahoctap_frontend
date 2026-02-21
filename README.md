# Hệ thống Quản lý Sinh viên - Kết quả Học tập (Frontend Admin)

<p align="center">
  <a href="https://nextjs.org/" target="_blank">
    <img src="https://uploads.teachablecdn.com/attachments/oQIuEdJiQTduJC3OIzKy_nextjs-complete-guide-thumb.jpg" width="200" alt="Next.js Logo" />
  </a>
</p>

<p align="center">
  Frontend Admin cho hệ thống quản lý sinh viên và kết quả học tập
</p>

<p align="center">
  <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-16.x-black" alt="Next.js Version" /></a>
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-19-blue" alt="React Version" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript Version" /></a>
</p>

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Các tính năng chính](#các-tính-năng-chính)
- [Các trang quản lý](#các-trang-quản-lý)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

---

## 🎯 Giới thiệu

Frontend Admin của hệ thống Quản lý Sinh viên - Kết quả Học tập được xây dựng bằng **Next.js 16** và **React 19**, cung cấp giao diện quản trị hiện đại và thân thiện với người dùng để quản lý toàn bộ quy trình đào tạo.

Ứng dụng được xây dựng dựa trên template **TailAdmin** với giao diện đẹp mắt, hỗ trợ dark mode, và được tối ưu hóa cho trải nghiệm người dùng tốt nhất.

---

## 🛠 Công nghệ sử dụng

- **Framework**: Next.js 16.x
- **UI Library**: React 19
- **Ngôn ngữ**: TypeScript 5.9
- **Styling**: Tailwind CSS v4
- **Icons**: React Icons, Font Awesome
- **Charts**: ApexCharts
- **Calendar**: FullCalendar
- **Forms**: Headless UI
- **File Upload**: React Dropzone
- **State Management**: React Context API
- **HTTP Client**: Fetch API

---

## 🏗 Các tính năng chính

### 1. **Xác thực & Quản lý người dùng**
- Đăng nhập, đăng xuất
- Quản lý tài khoản người dùng
- Phân quyền theo vai trò
- Đổi mật khẩu với xác thực OTP

### 2. **Quản lý Danh mục**
- Quản lý Khoa (thêm, sửa, xóa, tìm kiếm)
- Quản lý Ngành (thêm, sửa, xóa, tìm kiếm)
- Quản lý Lớp niên chế (thêm, sửa, xóa, tìm kiếm)
- Quản lý Môn học (thêm, sửa, xóa, tìm kiếm)
- Quản lý Giảng viên (thêm, sửa, xóa, tìm kiếm)
- Quản lý Niên khóa
- Quản lý Năm học - Học kỳ
- Upload danh sách từ file Excel

### 3. **Quản lý Sinh viên**
- Quản lý thông tin sinh viên
- Upload danh sách sinh viên từ file Excel
- Tìm kiếm và lọc sinh viên
- Xem bảng điểm của sinh viên
- Xét tốt nghiệp

### 4. **Quản lý Chương trình Đào tạo**
- Quản lý chương trình đào tạo (CTDT)
- Xem chi tiết CTDT
- Tạo CTDT mới
- Quản lý môn học trong CTDT

### 5. **Quản lý Lớp học phần**
- Quản lý lớp học phần
- Quản lý sinh viên trong lớp học phần
- Yêu cầu sinh viên đăng ký học phần
- Quản lý lớp học phần theo giảng viên
- Quản lý điểm cho sinh viên
- Tạo lớp học phần mới
- Tạo lớp học phần học lại

### 6. **Quản lý Kết quả**
- Nhập điểm cho sinh viên
- Cập nhật điểm
- Xem kết quả học tập
- Upload điểm từ file Excel

### 7. **Giao diện & Trải nghiệm**
- Dark mode / Light mode
- Responsive design (mobile, tablet, desktop)
- Sidebar có thể thu gọn
- Calendar tích hợp
- Charts và biểu đồ trực quan
- Form validation
- File upload với drag & drop

---

## 📄 Các trang quản lý

### 🏠 Dashboard
- Trang chủ với tổng quan hệ thống
- Thống kê nhanh
- Biểu đồ và charts

### 📚 Quản lý Danh mục
- **Quản lý Khoa** (`/quan-ly-khoa`)
- **Quản lý Ngành** (`/quan-ly-nganh`)
- **Quản lý Lớp niên chế** (`/quan-ly-lop-nien-che`)
- **Quản lý Môn học** (`/quan-ly-mon-hoc`)
- **Quản lý Giảng viên** (`/quan-ly-giang-vien`)
- **Quản lý Niên khóa** (`/quan-ly-nien-khoa`)
- **Quản lý Năm học - Học kỳ** (`/quan-ly-namhoc-hocky`)

### 👥 Quản lý Sinh viên
- **Quản lý Sinh viên** (`/quan-ly-sinh-vien`)
  - Danh sách sinh viên
  - Thêm, sửa, xóa sinh viên
  - Upload từ Excel
- **Bảng điểm** (`/quan-ly-sinh-vien/bang-diem`)
- **Xét tốt nghiệp** (`/quan-ly-sinh-vien/xet-tot-nghiep`)

### 🎓 Quản lý Đào tạo
- **Quản lý CTDT** (`/quan-ly-ctdt`)
  - Danh sách chương trình đào tạo
  - Chi tiết CTDT
- **Tạo CTDT mới** (`/them-ctdt-moi`)

### 📖 Quản lý Lớp học phần
- **Quản lý Lớp học phần** (`/quan-ly-lop-hoc-phan`)
  - Danh sách lớp học phần
  - Quản lý sinh viên trong lớp (`/quan-ly-lop-hoc-phan/quan-ly-sv-lhp`)
  - Yêu cầu sinh viên (`/quan-ly-lop-hoc-phan/yeu-cau-sinh-vien`)
- **Quản lý Lớp học phần theo Giảng viên** (`/quan-ly-lop-hoc-phan-theo-giang-vien`)
  - Quản lý điểm (`/quan-ly-lop-hoc-phan-theo-giang-vien/quan-ly-diem`)
- **Tạo Lớp học phần** (`/them-lop-hoc-phan`)
- **Tạo Lớp học phần học lại** (`/them-lop-hoc-phan-hoc-lai`)
- **Thêm Sinh viên học lại** (`/them-sinh-vien-hoc-lai`)

### 👤 Quản lý Tài khoản
- **Quản lý Tài khoản** (`/quan-ly-tai-khoan`)
  - Danh sách tài khoản
  - Thêm, sửa, xóa tài khoản
  - Phân quyền

### 📊 Các trang khác
- **Profile** (`/profile`) - Quản lý thông tin cá nhân
- **Calendar** (`/calendar`) - Lịch học, lịch giảng dạy
- **Charts** (`/bar-chart`, `/line-chart`) - Biểu đồ thống kê
- **Tables** (`/basic-tables`, `/second-table`) - Bảng dữ liệu
- **Form Elements** (`/form-elements`) - Các thành phần form

---

## 💻 Yêu cầu hệ thống

- **Node.js**: phiên bản 18.x trở lên (khuyến nghị 20.x)
- **npm**: phiên bản 9.x trở lên (hoặc yarn)
- **Git**: để clone repository

---

## 📦 Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd quanlysinhvien-ketquahoctap_frontend
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

Hoặc nếu gặp lỗi peer dependency:

```bash
npm install --legacy-peer-deps
```

Lệnh này sẽ cài đặt tất cả các package cần thiết được liệt kê trong `package.json`.

### Bước 3: Tạo file cấu hình môi trường

Tạo file `.env.local` ở thư mục gốc của dự án (cùng cấp với `package.json`). Xem chi tiết ở phần [Cấu hình môi trường](#cấu-hình-môi-trường).

---

## ⚙️ Cấu hình môi trường

Tạo file `.env.local` trong thư mục gốc của dự án với nội dung sau:

```env
# ===== Cấu hình Backend API =====
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# ===== Cấu hình Frontend URLs =====
NEXT_PUBLIC_FRONTEND_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_CL_SIDE_URL=http://localhost:3002
```

### Giải thích các biến môi trường:

- **NEXT_PUBLIC_BACKEND_URL**: Địa chỉ URL của backend API (mặc định: `http://localhost:3000`)
- **NEXT_PUBLIC_FRONTEND_ADMIN_URL**: URL của frontend admin (mặc định: `http://localhost:3001`)
- **NEXT_PUBLIC_FRONTEND_CL_SIDE_URL**: URL của frontend client-side (mặc định: `http://localhost:3002`)

⚠️ **Lưu ý**: 
- Trong Next.js, các biến môi trường có prefix `NEXT_PUBLIC_` sẽ được expose ra client-side
- File `.env.local` không nên được commit lên Git (đã có trong `.gitignore`)

---

## 🚀 Chạy ứng dụng

### Chế độ Development (có hot-reload)

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3001` (hoặc port bạn đã cấu hình).

Khi có thay đổi code, ứng dụng sẽ tự động reload.

### Chế độ Production

**Bước 1: Build ứng dụng**

```bash
npm run build
```

Lệnh này sẽ build ứng dụng Next.js và tối ưu hóa cho production.

**Bước 2: Chạy ứng dụng**

```bash
npm run start
```

Ứng dụng sẽ chạy tại `http://localhost:3001`.

### Kiểm tra ứng dụng đã chạy

Mở trình duyệt và truy cập:

```
http://localhost:3001
```

Nếu thấy trang đăng nhập hoặc dashboard, nghĩa là ứng dụng đã chạy thành công! 🎉

---

## 📁 Cấu trúc dự án

```
quanlysinhvien-ketquahoctap_frontend/
├── public/                    # Static files
│   ├── images/               # Hình ảnh
│   ├── templates/            # File mẫu Excel
│   └── favicon.ico
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (admin)/          # Admin routes (group)
│   │   │   ├── (others-pages)/
│   │   │   │   ├── quan-ly-khoa/
│   │   │   │   ├── quan-ly-nganh/
│   │   │   │   ├── quan-ly-lop-nien-che/
│   │   │   │   ├── quan-ly-mon-hoc/
│   │   │   │   ├── quan-ly-giang-vien/
│   │   │   │   ├── quan-ly-sinh-vien/
│   │   │   │   ├── quan-ly-ctdt/
│   │   │   │   ├── quan-ly-lop-hoc-phan/
│   │   │   │   ├── quan-ly-tai-khoan/
│   │   │   │   └── ...
│   │   │   ├── Dashboard.tsx
│   │   │   ├── layout.tsx    # Admin layout
│   │   │   └── page.tsx      # Admin home
│   │   │
│   │   ├── (full-width-pages)/  # Full width pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── not-found.tsx     # 404 page
│   │
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── calendar/        # Calendar components
│   │   ├── charts/          # Chart components
│   │   ├── common/          # Common components
│   │   ├── form/            # Form components
│   │   ├── header/          # Header components
│   │   ├── tables/          # Table components
│   │   ├── ui/              # UI components
│   │   └── user-profile/    # User profile components
│   │
│   ├── config/              # Configuration files
│   │   └── env.ts          # Environment variables
│   │
│   ├── context/             # React Context
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useGoBack.ts
│   │   └── useModal.ts
│   │
│   ├── icons/              # Icon components
│   │
│   ├── layout/             # Layout components
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── Backdrop.tsx
│   │   └── SidebarWidget.tsx
│   │
│   └── utils/              # Utility functions
│       └── auth.ts         # Authentication utilities
│
├── .env.local              # Environment variables (create)
├── .gitignore
├── next.config.ts          # Next.js configuration
├── package.json
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

---

## 🎨 Tính năng giao diện

### Dark Mode / Light Mode
- Hỗ trợ chuyển đổi giữa dark mode và light mode
- Theme được lưu trong localStorage
- Sử dụng `ThemeContext` để quản lý theme

### Responsive Design
- Tối ưu cho mobile, tablet, và desktop
- Sidebar tự động thu gọn trên màn hình nhỏ
- Layout linh hoạt với Tailwind CSS

### Components
- **Sidebar**: Sidebar có thể thu gọn với menu navigation
- **Header**: Header với thông tin người dùng và notifications
- **Tables**: Bảng dữ liệu với pagination, sorting, filtering
- **Forms**: Form components với validation
- **Charts**: Biểu đồ với ApexCharts
- **Calendar**: Lịch với FullCalendar
- **Modals**: Modal dialogs
- **Alerts**: Thông báo và alerts

---

## 📤 Upload File Excel

Hệ thống hỗ trợ upload file Excel để import dữ liệu hàng loạt. Các file mẫu có sẵn trong thư mục `public/templates/`:

- `mau-nhap-sinh-vien.xlsx` - Mẫu nhập sinh viên
- `mau-nhap-giang-vien.xlsx` - Mẫu nhập giảng viên
- `mau-nhap-lop.xlsx` - Mẫu nhập lớp
- `mau-nhap-nganh.xlsx` - Mẫu nhập ngành
- `mau-nhap-mon-hoc.xlsx` - Mẫu nhập môn học
- `mau-nhap-mon-hoc-ctdt.xlsx` - Mẫu nhập môn học CTDT
- `mau-nhap-lop-hoc-phan.xlsx` - Mẫu nhập lớp học phần
- `mau-nhap-sinh-vien-lhp.xlsx` - Mẫu nhập sinh viên vào lớp học phần
- `mau-nhap-diem.xlsx` - Mẫu nhập điểm

---

## 🔒 Bảo mật

- JWT token được lưu trong localStorage hoặc cookies
- API calls được bảo vệ bằng JWT authentication
- Input validation trên client-side
- XSS protection với Next.js built-in security

---

## 🧪 Chạy tests

```bash
# Lint code
npm run lint
```

---

## 📝 Scripts có sẵn

- `npm run dev` - Chạy ứng dụng (development mode với hot-reload)
- `npm run build` - Build ứng dụng cho production
- `npm run start` - Chạy ứng dụng từ thư mục `.next/` (production mode)
- `npm run lint` - Kiểm tra và sửa lỗi code style với ESLint

---

## 🔗 Kết nối với Backend

Frontend này được thiết kế để kết nối với Backend API tại `http://localhost:3000` (hoặc URL bạn đã cấu hình trong `.env.local`).

Đảm bảo:
1. Backend đã được chạy và có thể truy cập
2. CORS đã được cấu hình đúng trên backend
3. File `.env.local` đã được cấu hình với `NEXT_PUBLIC_BACKEND_URL` đúng

---

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt hoặc sử dụng, vui lòng:

1. Kiểm tra lại file `.env.local` đã được cấu hình đúng chưa
2. Đảm bảo Node.js đã được cài đặt đúng phiên bản (18.x trở lên)
3. Kiểm tra port 3001 có bị chiếm dụng không
4. Xem log lỗi trong terminal để biết thêm chi tiết
5. Thử xóa `node_modules` và `.next`, sau đó chạy lại `npm install`

---

## 📄 License

[MIT licensed](LICENSE)

---

## 🙏 Credits

Template dựa trên [TailAdmin Next.js](https://tailadmin.com) - Free Next.js Tailwind Admin Dashboard Template.

---

<p align="center">
  Made with ❤️ using Next.js & React
</p>
