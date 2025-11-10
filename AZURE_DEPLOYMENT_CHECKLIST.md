# 🚀 Azure Deployment - Hướng Dẫn Nhanh

## Tình Trạng Hiện Tại
✅ **Code đã push lên GitHub:** https://github.com/thaibs080603-tech/first-app (branch: `main`)
✅ **Các tệp cấu hình Azure đã sẵn sàng**
✅ **Có 2 hướng dẫn deployment:**
- `AZURE_DEPLOYMENT.md` - Hướng dẫn chi tiết với Azure CLI
- `AZURE_PORTAL_QUICKSTART.md` - Hướng dẫn dùng Azure Portal (dễ dàng nhất)

---

## ⚡ Bước Tiếp Theo - Deploy Lên Azure

### Phương Pháp 1: Azure Portal (Dễ Nhất - Khuyến Khích)

**Thời gian:** ~10-15 phút
**Yêu cầu:** Chỉ cần Azure account

1. Đi tới https://portal.azure.com
2. Làm theo các bước trong file `AZURE_PORTAL_QUICKSTART.md`
3. Tất cả các bước được hướng dẫn chi tiết có kèm hình ảnh

### Phương Pháp 2: Azure CLI (Nâng Cao)

**Thời gian:** ~5-10 phút
**Yêu cầu:** Azure CLI + PowerShell

Xem chi tiết trong `AZURE_DEPLOYMENT.md`

---

## 📋 Checklist Trước Deployment

Hãy chuẩn bị những thông tin này trước khi deploy:

- [ ] **Azure Account** - Có Azure subscription hoạt động
- [ ] **Azure MySQL Database** - Có database MySQL trên Azure hoặc host khác
  - Database connection string (DATABASE_URL)
  - Định dạng: `mysql://user:password@host:3306/dbname?sslaccept=strict`
- [ ] **JWT Secret** - Tạo secure token
  - Chạy: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Copy kết quả (32+ ký tự random)

---

## 🎯 Quá Trình Deployment (Tóm Tắt)

1. **Tạo Resources trên Azure**
   - Resource Group
   - App Service Plan
   - Web App

2. **Kết nối GitHub**
   - Deployment Center → GitHub
   - Select: `thaibs080603-tech/first-app` (branch: `main`)

3. **Set Environment Variables**
   ```
   DATABASE_URL = <your_mysql_connection_string>
   JWT_SECRET = <generated_random_string>
   NEXT_PUBLIC_SOCKET_URL = https://your-app-name.azurewebsites.net
   NODE_ENV = production
   PORT = 8080
   ```

4. **Enable WebSocket** (quan trọng cho Socket.IO)
   - Configuration → General settings → Web sockets: ON

5. **Azure tự động deploy** từ GitHub!

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra **Log Stream** trong App Service
2. Xem chi tiết trong hướng dẫn `AZURE_DEPLOYMENT.md` hoặc `AZURE_PORTAL_QUICKSTART.md`
3. Chắc chắn tất cả environment variables đã set đúng
4. Restart app nếu cần

---

## 📊 Cấu Trúc Files Azure

```
your-app/
├── AZURE_DEPLOYMENT.md          # Chi tiết đầy đủ
├── AZURE_PORTAL_QUICKSTART.md   # Quick start (Portal)
├── web.config                    # IIS configuration
├── .deployment                   # Deployment manifest
├── .azure/
│   └── config.json              # Azure config
└── deploy.sh                     # Deployment script
```

---

## 💡 Mẹo

- **Lần đầu deploy**: Có thể mất 3-5 phút, đó là bình thường
- **Update ứng dụng**: Chỉ cần push code lên GitHub, Azure tự động redeploy
- **Xem logs**: App Service → Log Stream (rất hữu ích khi debug)
- **Restart nhanh**: App Service → Restart button

---

**Bạn đã sẵn sàng deploy! 🎉**

Hãy bắt đầu bằng cách mở `AZURE_PORTAL_QUICKSTART.md` và làm theo các bước.

Good luck! 🚀
