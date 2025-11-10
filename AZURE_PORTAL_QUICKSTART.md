# Azure Deployment - Quick Start Guide (Azure Portal)

## 🚀 Bước 1: Truy cập Azure Portal

1. Mở trình duyệt và đi tới [portal.azure.com](https://portal.azure.com)
2. Đăng nhập bằng tài khoản Azure của bạn
3. Nếu được yêu cầu xác thực 2 lớp (MFA), hãy hoàn thành

## 🚀 Bước 2: Tạo Resource Group

1. Tìm kiếm **"Resource groups"** trong search bar
2. Click **"Create"**
3. Nhập thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource group name**: `first-app-rg`
   - **Region**: `Southeast Asia`
4. Click **"Review + create"** → **"Create"**

## 🚀 Bước 3: Tạo App Service Plan

1. Tìm kiếm **"App Service plans"** 
2. Click **"Create"**
3. Nhập thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource Group**: `first-app-rg`
   - **Name**: `first-app-plan`
   - **Operating System**: `Linux`
   - **Region**: `Southeast Asia`
   - **Pricing tier**: Chọn **B2** (hoặc B1 để tiết kiệm)
4. Click **"Review + create"** → **"Create"**

## 🚀 Bước 4: Tạo Web App

1. Tìm kiếm **"App Services"** 
2. Click **"Create"** → **"Web App"**
3. Nhập thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource Group**: `first-app-rg`
   - **Name**: `first-app-unique-name` (phải unique, ví dụ: `first-app-bichngoc`)
   - **Publish**: `Code`
   - **Runtime stack**: `Node`
   - **Operating System**: `Linux`
   - **Region**: `Southeast Asia`
   - **App Service plan**: `first-app-plan`
4. Click **"Review + create"** → **"Create"**

Đợi cho đến khi deployment hoàn thành (2-3 phút)

## 🚀 Bước 5: Kết nối GitHub Repository

1. Vào App Service của bạn (go to resource)
2. Trong menu bên trái, tìm **"Deployment Center"**
3. Chọn **"GitHub"** từ Source dropdown
4. Click **"Authorize"** để kết nối GitHub account
5. Sau khi authorize:
   - **Organization**: `thaibs080603-tech`
   - **Repository**: `first-app`
   - **Branch**: `main`
6. Click **"Save"**

Azure sẽ tự động deploy code của bạn từ GitHub!

## 🚀 Bước 6: Cấu hình Environment Variables

1. Vẫn trong App Service, mở menu **"Configuration"**
2. Click **"New application setting"** để thêm từng biến:

### Database Configuration
- **Name**: `DATABASE_URL`
- **Value**: Paste connection string của Azure MySQL database của bạn
  ```
  mysql://user:password@host:3306/database?sslaccept=strict
  ```

### JWT Secret (Bảo mật)
- **Name**: `JWT_SECRET`
- **Value**: Tạo chuỗi ngẫu nhiên 32 ký tự
  ```
  Mở PowerShell và chạy:
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
  Sau đó copy kết quả vào đây

### Socket URL
- **Name**: `NEXT_PUBLIC_SOCKET_URL`
- **Value**: `https://first-app-unique-name.azurewebsites.net`
  (Thay `first-app-unique-name` bằng tên app của bạn)

### Node Environment
- **Name**: `NODE_ENV`
- **Value**: `production`

### Port
- **Name**: `PORT`
- **Value**: `8080`

Sau khi thêm xong tất cả, click **"Save"** ở trên cùng

## 🚀 Bước 7: Kích hoạt WebSocket

WebSocket là cần thiết cho Socket.IO:

1. Vẫn trong App Service, mở menu **"Configuration"**
2. Click tab **"General settings"**
3. Tìm **"Web sockets"** và chuyển thành **"On"**
4. Click **"Save"**

## 🚀 Bước 8: Kiểm tra Deployment

1. Vào **"Deployment Center"**
2. Xem lịch sử deployment
3. Nếu thấy checkmark ✅, deployment thành công
4. Nếu thấy ❌, click vào để xem chi tiết lỗi

## 🚀 Bước 9: Truy cập Ứng dụng

1. Vào App Service → **"Overview"**
2. Copy URL từ mục **"Default domain"**
   - Nó sẽ giống như: `https://first-app-unique-name.azurewebsites.net`
3. Mở URL trong trình duyệt

## 🧪 Kiểm tra Chức năng

1. **Đăng ký**: Tạo tài khoản mới
2. **Đăng nhập**: Đăng nhập bằng credentials vừa tạo
3. **Gửi tin nhắn**: Gửi một tin nhắn test
4. **Kiểm tra Socket.IO**: 
   - Mở một tab khác hoặc cửa sổ khác
   - Đăng nhập vào app
   - Gửi tin nhắn từ tab/cửa sổ đầu tiên
   - Kiểm tra nó có xuất hiện realtime trên tab/cửa sổ thứ hai không

## 📊 Xem Logs

Nếu ứng dụng có vấn đề:

1. Vào App Service → **"Log Stream"** 
2. Xem các log realtime từ ứng dụng
3. Tìm kiếm error messages

## 🔧 Các Lệnh Hữu Ích Trong Azure Portal

### Restart App
- **Settings** → **Restart** → **Yes**

### View File System
- **Development tools** → **App Service Editor** (or **SSH**)

### Check Database Connection
- Gửi một API request hoặc check logs

## ⚠️ Troubleshooting

### Ứng dụng không khởi động
- Kiểm tra logs trong **Log Stream**
- Kiểm tra tất cả environment variables đã set đúng chưa
- Đảm bảo DATABASE_URL hợp lệ
- Restart app thử lại

### Socket.IO không kết nối
- Kiểm tra `NEXT_PUBLIC_SOCKET_URL` đúng chưa
- Kiểm tra WebSocket đã bật
- Mở DevTools (F12) → Console → xem error messages

### Database connection failed
- Kiểm tra Azure MySQL firewall rules
- Đảm bảo connection string chính xác
- Thử test connection từ máy local trước

## 📝 Cheat Sheet

| Tác vụ | Vị trí |
|--------|--------|
| Xem Logs | App Service → Log Stream |
| Set Environment Variables | App Service → Configuration → App settings |
| Enable WebSocket | App Service → Configuration → General settings → Web sockets |
| Xem URL App | App Service → Overview → Default domain |
| Restart App | App Service → Restart |
| View File System | App Service → App Service Editor |
| Check Performance | App Service → App Service plan → Autoscale settings |

## 🎯 Liên kết Hữu Ích

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Deploy Node.js Apps](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Next.js Docs](https://nextjs.org/docs)
- [Socket.IO Docs](https://socket.io/docs/v4/)

---

**Mục tiêu cuối cùng**: Sau khi hoàn thành tất cả các bước trên, ứng dụng của bạn sẽ chạy trên Azure và có thể truy cập từ bất kỳ nơi nào qua internet! 🎉

Nếu gặp vấn đề, hãy kiểm tra logs và environment variables trước tiên. Hầu hết các vấn đề đều từ database connection hoặc Socket.IO URL.
