# FinTech Project Usage

## 1. Mục tiêu repo

Repo này gồm 3 ứng dụng chính:

- `backend`: Spring Boot API cho xác thực, ví, giao dịch, ngân sách, nợ, tiết kiệm, AI và admin.
- `frontend`: web app React/Vite cho dashboard desktop/web.
- `fintech-mobile`: mobile app Expo/React Native cho trải nghiệm di động.

Luồng chung:

1. `frontend` hoặc `fintech-mobile` gọi API ở `backend`.
2. `backend` xử lý business logic, lưu dữ liệu qua JPA repository.
3. `frontend` ưu tiên dashboard web đầy đủ.
4. `fintech-mobile` ưu tiên giao diện mobile gọn, đọc nhanh dòng tiền và trạng thái tài khoản.

## 2. Cách chạy nhanh

### Backend

1. Chuẩn bị Java 21 và MySQL.
2. Cập nhật `backend/src/main/resources/application.properties`.
3. Chạy:

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend web

```bash
cd frontend
npm install
npm run dev
```

### Fintech mobile

```bash
cd fintech-mobile
npm install
npx expo start
```

Lưu ý mobile:

- URL API đang lấy từ `fintech-mobile/.env`.
- Mobile app vừa được tách theo kiến trúc `routes mỏng -> features -> shared components -> services/utils/providers`.
- `node_modules` hiện đang lỗi cài đặt cục bộ, nên `tsc` và một số lệnh Expo không chạy được ổn định nếu chưa cài lại dependency.

## 3. Thư mục gốc

| Path | Vai trò |
| --- | --- |
| `.github/` | Hook/phần hỗ trợ nội bộ liên quan java-upgrade. Không phải logic sản phẩm. |
| `backend/` | API Spring Boot. |
| `frontend/` | Web app React/Vite. |
| `fintech-mobile/` | Mobile app Expo/React Native. |
| `usage.md` | Tài liệu này. |

### `.github/java-upgrade`

| Path | Vai trò |
| --- | --- |
| `.github/java-upgrade/.gitignore` | Ignore file cho tool java-upgrade. |
| `.github/java-upgrade/hooks/scripts/recordToolUse.ps1` | Script PowerShell ghi nhận việc dùng tool nội bộ. |
| `.github/java-upgrade/hooks/scripts/recordToolUse.sh` | Bản shell của script ghi nhận tool nội bộ. |

---

## 4. Backend

### 4.1 File gốc

| Path | Vai trò |
| --- | --- |
| `backend/pom.xml` | Khai báo dependency Spring Boot, JWT, mail, JPA, MySQL, OpenAPI. |
| `backend/mvnw` | Maven wrapper cho Unix/macOS/Linux. |
| `backend/mvnw.cmd` | Maven wrapper cho Windows. |

### 4.2 `src/main/java/com/fintrack/backend`

| Path | Vai trò |
| --- | --- |
| `BackendApplication.java` | Entry point khởi động Spring Boot. |

### 4.3 `config/`

| File | Vai trò |
| --- | --- |
| `config/CorsConfig.java` | Cấu hình CORS cho frontend/mobile gọi API. |
| `config/DotenvConfig.java` | Nạp biến môi trường từ `.env` cho backend. |
| `config/SecurityConfig.java` | Cấu hình bảo mật, quyền truy cập, filter JWT. |

### 4.4 `controller/`

| File | Vai trò |
| --- | --- |
| `controller/AuthController.java` | API đăng ký, đăng nhập, quên mật khẩu, OTP, reset password và cập nhật trạng thái account admin. |
| `controller/UserController.java` | API lấy profile người dùng hiện tại. |
| `controller/WalletController.java` | CRUD ví cá nhân. |
| `controller/TransactionController.java` | CRUD giao dịch. |
| `controller/CategoryController.java` | CRUD danh mục. |
| `controller/SubCategoryController.java` | API danh mục con theo category. |
| `controller/BudgetController.java` | CRUD ngân sách theo ví. |
| `controller/DebtController.java` | API khoản nợ và lịch sử trả nợ. |
| `controller/SavingController.java` | API mục tiêu tiết kiệm, nạp/rút tiết kiệm. |
| `controller/AiController.java` | API chat/AI. |
| `controller/AdminController.java` | API dashboard admin, users, wallets, transactions, debts, savings. |

### 4.5 `dto/` request

| File | Vai trò |
| --- | --- |
| `dto/LoginRequest.java` | Payload đăng nhập. |
| `dto/RegisterRequest.java` | Payload đăng ký người dùng mới. |
| `dto/ForgotPasswordRequest.java` | Payload yêu cầu OTP quên mật khẩu. |
| `dto/VerifyOtpRequest.java` | Payload xác minh OTP. |
| `dto/ResetPasswordRequest.java` | Payload đặt lại mật khẩu. |
| `dto/WalletRequest.java` | Payload tạo/cập nhật ví. |
| `dto/TransactionRequest.java` | Payload tạo/cập nhật giao dịch. |
| `dto/CategoryRequest.java` | Payload tạo/cập nhật category. |
| `dto/SubCategoryRequest.java` | Payload tạo sub-category. |
| `dto/BudgetRequest.java` | Payload tạo/cập nhật budget. |
| `dto/DebtRequest.java` | Payload tạo khoản nợ. |
| `dto/DebtPaymentRequest.java` | Payload trả nợ. |
| `dto/SavingRequest.java` | Payload tạo mục tiêu tiết kiệm. |
| `dto/SavingTransactionRequest.java` | Payload nạp vào tiết kiệm. |
| `dto/WithdrawSavingRequest.java` | Payload rút từ tiết kiệm. |
| `dto/ChatRequest.java` | Payload gọi AI/chat. |

### 4.6 `dto/Response/`

| File | Vai trò |
| --- | --- |
| `dto/Response/LoginResponse.java` | Response đăng nhập chứa access token, userId, username, role. |
| `dto/Response/WalletResponse.java` | Response gọn cho wallet. |
| `dto/Response/TransactionResponse.java` | Response gọn cho transaction. |
| `dto/Response/CategoryResponse.java` | Response category. |
| `dto/Response/SubCategoryResponse.java` | Response sub-category. |
| `dto/Response/BudgetResponse.java` | Response ngân sách. |
| `dto/Response/DebtResponse.java` | Response khoản nợ. |
| `dto/Response/DebtPaymentResponse.java` | Response lịch sử trả nợ. |
| `dto/Response/SavingResponse.java` | Response mục tiêu tiết kiệm. |
| `dto/Response/SavingTransactionResponse.java` | Response giao dịch tiết kiệm. |
| `dto/Response/ChatResponse.java` | Response AI/chat. |
| `dto/Response/AdminStatsResponse.java` | Response thống kê admin. |
| `dto/Response/AdminTransactionResponse.java` | Response giao dịch cho admin. |
| `dto/Response/AdminUserResponse.java` | Response user cho admin. |

### 4.7 `enums/`

| File | Vai trò |
| --- | --- |
| `enums/Role.java` | Vai trò tài khoản. |
| `enums/Sex.java` | Giới tính được backend hỗ trợ. |
| `enums/WalletType.java` | Loại ví. |
| `enums/TransactionType.java` | Loại giao dịch. |
| `enums/CategoryType.java` | Loại category. |
| `enums/BudgetType.java` | Loại budget. |
| `enums/BudgetPeriod.java` | Chu kỳ budget. |
| `enums/SavingType.java` | Loại tiết kiệm. |
| `enums/SavingStatus.java` | Trạng thái tiết kiệm. |
| `enums/SavingPeriod.java` | Chu kỳ tiết kiệm. |

### 4.8 `mapper/`

| File | Vai trò |
| --- | --- |
| `mapper/WalletMapper.java` | Map entity wallet sang response. |
| `mapper/BudgetMapper.java` | Map entity budget sang response. |
| `mapper/DebtMapper.java` | Map entity debt sang response. |
| `mapper/PaymentMapper.java` | Map payment sang response. |
| `mapper/SavingMapper.java` | Map saving/saving transaction sang response. |

### 4.9 `model/`

| File | Vai trò |
| --- | --- |
| `model/Account.java` | Tài khoản đăng nhập, principal cho security. |
| `model/InfoUser.java` | Thông tin mở rộng của người dùng. |
| `model/Wallet.java` | Entity ví. |
| `model/Transaction.java` | Entity giao dịch. |
| `model/Category.java` | Entity category. |
| `model/SubCategory.java` | Entity sub-category. |
| `model/Budget.java` | Entity ngân sách. |
| `model/Debt.java` | Entity khoản nợ. |
| `model/DebtPayment.java` | Entity lịch sử trả nợ. |
| `model/Saving.java` | Entity mục tiêu tiết kiệm. |
| `model/SavingTransaction.java` | Entity giao dịch nạp/rút tiết kiệm. |
| `model/PasswordResetOtp.java` | Entity OTP reset password. |

### 4.10 `repository/`

| File | Vai trò |
| --- | --- |
| `repository/AccountRepository.java` | Truy cập bảng account. |
| `repository/InfoUserRepository.java` | Truy cập bảng info user. |
| `repository/OtpRepository.java` | Truy cập OTP reset password. |
| `repository/WalletRepository.java` | Truy cập wallet. |
| `repository/TransactionRepository.java` | Truy cập transaction. |
| `repository/CategoryRepository.java` | Truy cập category. |
| `repository/SubCategoryRepository.java` | Truy cập sub-category. |
| `repository/BudgetRepository.java` | Truy cập budget. |
| `repository/DebtRepository.java` | Truy cập debt. |
| `repository/DebtPaymentRepository.java` | Truy cập payment của debt. |
| `repository/SavingRepository.java` | Truy cập saving. |
| `repository/SavingTransactionRepository.java` | Truy cập transaction của saving. |

### 4.11 `sercurity/`

| File | Vai trò |
| --- | --- |
| `sercurity/JwtAuthenticationFilter.java` | Filter xác thực JWT trên request vào. |
| `sercurity/HashUtil.java` | Hỗ trợ hash dữ liệu nếu cần. |

### 4.12 `service/`

| File | Vai trò |
| --- | --- |
| `service/AuthService.java` | Business logic auth, register, login, forgot/reset password. |
| `service/JwtService.java` | Tạo và kiểm tra JWT. |
| `service/EmailService.java` | Gửi email, đặc biệt cho reset password. |
| `service/WalletService.java` | Logic ví. |
| `service/TransactionService.java` | Logic giao dịch. |
| `service/CategoryService.java` | Logic category. |
| `service/SubCategoryService.java` | Logic sub-category. |
| `service/BudgetService.java` | Logic budget. |
| `service/DebtService.java` | Logic khoản nợ. |
| `service/SavingService.java` | Logic tiết kiệm. |
| `service/AiService.java` | Lớp AI tổng quát. |
| `service/AiAnalyzerService.java` | AI phân tích dữ liệu tài chính. |
| `service/AiPredictService.java` | AI dự báo xu hướng. |
| `service/TransactionAIService.java` | AI liên quan transaction. |
| `service/GeminiService.java` | Tích hợp Gemini. |
| `service/AdminService.java` | Logic dashboard/admin aggregate. |

### 4.13 `util/`

| File | Vai trò |
| --- | --- |
| `util/OtpGenerator.java` | Sinh OTP cho quên mật khẩu. |

### 4.14 `resources/`

| File | Vai trò |
| --- | --- |
| `resources/application.properties` | Cấu hình Spring Boot, DB, mail, server. |
| `resources/templates/reset-password-email.html` | HTML email reset password. |
| `resources/static/` | Thư mục static, hiện chưa dùng đáng kể. |

### 4.15 `test/`

| File | Vai trò |
| --- | --- |
| `src/test/java/com/fintrack/backend/BackendApplicationTests.java` | Smoke test khởi động Spring Boot. |

---

## 5. Frontend web

### 5.1 File gốc

| Path | Vai trò |
| --- | --- |
| `frontend/package.json` | Dependency và script Vite. |
| `frontend/package-lock.json` | Lockfile npm. |
| `frontend/vite.config.js` | Cấu hình Vite. |
| `frontend/eslint.config.js` | Cấu hình ESLint cho web app. |
| `frontend/index.html` | HTML entry của Vite. |
| `frontend/README.md` | README phần web. |
| `frontend/public/vite.svg` | Asset logo mặc định của Vite. |

### 5.2 `src/` entry

| File | Vai trò |
| --- | --- |
| `src/main.jsx` | Mount ứng dụng React. |
| `src/App.jsx` | Router/cấu trúc ứng dụng chính. |
| `src/App.css` | CSS tổng cho App. |
| `src/index.css` | CSS global. |

### 5.3 `src/config/`

| File | Vai trò |
| --- | --- |
| `src/config/api.js` | Tập trung tất cả endpoint backend cho web app. |

### 5.4 `src/hooks/`

| File | Vai trò |
| --- | --- |
| `src/hooks/useAuth.js` | Hook bọc AuthContext cho web app. |

### 5.5 `src/context/`

| File | Vai trò |
| --- | --- |
| `src/context/AuthContext.jsx` | Context xác thực. |
| `src/context/WalletContext.jsx` | Context ví. |
| `src/context/TransactionContext.jsx` | Context giao dịch. |
| `src/context/CategoryContext.jsx` | Context category. |
| `src/context/DebtContext.jsx` | Context khoản nợ. |
| `src/context/SavingsContext.jsx` | Context tiết kiệm. |

### 5.6 `src/services/`

| File | Vai trò |
| --- | --- |
| `src/services/authService.js` | Gọi API auth cho web app. |
| `src/services/walletService.js` | Gọi API wallet. |
| `src/services/transactionService.js` | Gọi API transaction, chuẩn hóa dữ liệu và trả lỗi/empty-state theo phản hồi thật. |
| `src/services/categoryService.js` | Gọi API category và trả dữ liệu thật từ API, không dựng dữ liệu thay thế khi lỗi. |
| `src/services/subCategoryService.js` | Gọi API sub-category. |
| `src/services/budgetService.js` | Gọi API budget. |
| `src/services/debtService.js` | Gọi API debt. |
| `src/services/savingsService.js` | Gọi API saving. |
| `src/services/adminService.js` | Gọi API admin. |

### 5.7 `src/pages/`

| File | Vai trò |
| --- | --- |
| `src/pages/LandingPage.jsx` | Landing page giới thiệu sản phẩm. |
| `src/pages/HomePage.jsx` | Trang home sau đăng nhập hoặc container điều hướng. |
| `src/pages/LoginPage.jsx` | Trang đăng nhập. |
| `src/pages/RegisterPage.jsx` | Trang đăng ký. |
| `src/pages/ForgotPasswordPage.jsx` | Trang quên mật khẩu. |
| `src/pages/VerifyOTPPage.jsx` | Trang xác minh OTP. |
| `src/pages/ResetPasswordPage.jsx` | Trang reset password. |
| `src/pages/Dashboard.jsx` | Dashboard tài chính chính trên web. |
| `src/pages/TransactionsPage.jsx` | Màn hình quản lý giao dịch. |
| `src/pages/BudgetPage.jsx` | Màn hình ngân sách. |
| `src/pages/DebtPage.jsx` | Màn hình nợ. |
| `src/pages/SavingsPage.jsx` | Màn hình tiết kiệm. |
| `src/pages/CurrencyToolsPage.jsx` | Màn hình công cụ tiền tệ. |
| `src/pages/ChatBot.jsx` | Màn hình chatbot/AI. |
| `src/pages/AdminDashboard.jsx` | Dashboard riêng cho admin. |
| `src/pages/WalletDialog.jsx` | Màn hình/hộp thoại ví. |

### 5.8 `src/components/` dùng chung

| File | Vai trò |
| --- | --- |
| `src/components/Button.jsx` | Nút dùng chung. |
| `src/components/Input.jsx` | Input dùng chung. |
| `src/components/MultiSelectDropdown.jsx` | Dropdown chọn nhiều giá trị. |
| `src/components/PrivateRoute.jsx` | Chặn route chưa đăng nhập. |

### 5.9 `src/components/dashboard/`

| File | Vai trò |
| --- | --- |
| `dashboard/Sidebar.jsx` | Sidebar dashboard. |
| `dashboard/StatCard.jsx` | Thẻ số liệu tổng quan. |
| `dashboard/NetChangeCard.jsx` | Thẻ biến động dòng tiền. |
| `dashboard/TransactionList.jsx` | Danh sách giao dịch trong dashboard. |

### 5.10 `src/components/budget/`

| File | Vai trò |
| --- | --- |
| `budget/BudgetCard.jsx` | Thẻ hiển thị budget. |
| `budget/BudgetModal.jsx` | Modal tạo/sửa budget. |

### 5.11 `src/components/debt/`

| File | Vai trò |
| --- | --- |
| `debt/DebtModal.jsx` | Modal tạo/sửa debt. |
| `debt/PayModal.jsx` | Modal trả nợ. |

### 5.12 `src/components/savings/`

| File | Vai trò |
| --- | --- |
| `savings/SavingsCard.jsx` | Thẻ hiển thị saving goal. |
| `savings/SavingModal.jsx` | Modal tạo saving goal. |
| `savings/DepositModal.jsx` | Modal nạp tiền vào saving. |
| `savings/WithdrawModal.jsx` | Modal rút tiền từ saving. |

### 5.13 `src/components/transactions/`

| File | Vai trò |
| --- | --- |
| `transactions/AddTransactionModal.jsx` | Modal tạo/sửa giao dịch. |

### 5.14 `src/components/layout/`

| File | Vai trò |
| --- | --- |
| `layout/Header.jsx` | Header top bar dùng chung. |
| `layout/BottomNav.jsx` | Điều hướng dưới của layout web/mobile-like. |

### 5.15 `src/components/landing/`

| File | Vai trò |
| --- | --- |
| `landing/Navbar.jsx` | Navbar landing page. |
| `landing/Hero.jsx` | Hero section landing page. |
| `landing/Features.jsx` | Section tính năng. |
| `landing/HowItWorks.jsx` | Section cách hoạt động. |
| `landing/Pricing.jsx` | Section pricing/demo pricing. |
| `landing/Testimonials.jsx` | Section phản hồi người dùng. |
| `landing/FAQ.jsx` | Section FAQ. |
| `landing/CTASection.jsx` | Section CTA cuối trang. |
| `landing/Footer.jsx` | Footer landing page. |

### 5.16 `src/css/`

Nhóm CSS module cho từng component/trang:

| File | Vai trò |
| --- | --- |
| `css/Button.module.css` | Style cho nút dùng chung. |
| `css/Input.module.css` | Style input dùng chung. |
| `css/MultiSelectDropdown.module.css` | Style dropdown nhiều lựa chọn. |
| `css/Header.module.css` | Style header chung. |
| `css/BottomNav.module.css` | Style bottom nav. |
| `css/Sidebar.module.css` | Style sidebar dashboard. |
| `css/AddTransactionModal.module.css` | Style modal giao dịch. |
| `css/BudgetModal.module.css` | Style modal budget. |
| `css/BudgetPage.module.css` | Style trang budget. |
| `css/DebtModal.module.css` | Style modal debt. |
| `css/DebtPage.module.css` | Style trang debt. |
| `css/SavingModal.module.css` | Style modal saving. |
| `css/SavingsPage.module.css` | Style trang savings. |
| `css/TransactionsPage.module.css` | Style trang transactions. |
| `css/WalletDialog.module.css` | Style dialog ví. |
| `css/CurrencyToolsPage.module.css` | Style trang công cụ tiền tệ. |
| `css/ChatBot.module.css` | Style chatbot page. |
| `css/DashboardPage.module.css` | Style dashboard page. |
| `css/AdminDashboard.module.css` | Style admin dashboard. |
| `css/LandingPage.module.css` | Style landing page. |
| `css/LoginPage.module.css` | Style login page. |
| `css/RegisterPage.module.css` | Style register page. |
| `css/ForgotPasswordPage.module.css` | Style quên mật khẩu. |
| `css/VerifyOTPPage.module.css` | Style verify OTP. |
| `css/ResetPasswordPage.module.css` | Style reset password. |

### 5.17 `src/assets/`

| File | Vai trò |
| --- | --- |
| `src/assets/react.svg` | Icon React mặc định. |
| `src/assets/images/app-preview.png` | Ảnh preview sản phẩm. |
| `src/assets/images/get-started.avif` | Ảnh minh hoạ onboarding/get-started. |
| `src/assets/images/get-started.jpg` | Bản JPG của ảnh get-started. |
| `src/assets/images/get-started.webp` | Bản WebP của ảnh get-started. |
| `src/assets/images/hero-dashboard.jpg` | Ảnh hero cho dashboard/landing. |

### 5.18 `src/utils/`

Thư mục đang hiện diện nhưng hiện chưa có file đáng kể; có thể dùng để chứa helper web trong tương lai.

---

## 6. Fintech mobile

### 6.1 Mục tiêu kiến trúc mobile sau khi tái cấu trúc

`fintech-mobile` hiện được chia thành các lớp:

1. `src/app/`: chỉ giữ route của Expo Router, không chứa business logic lớn.
2. `src/features/`: mỗi màn hình/nghiệp vụ đặt theo domain.
3. `src/components/`: shared UI dùng lại ở nhiều màn hình.
4. `src/services/`: gọi API và gom dữ liệu.
5. `src/utils/`: formatter, AsyncStorage helper.
6. `src/providers/`: session/auth bootstrap cho toàn app.
7. `src/types/`: type domain.
8. `src/constants/`: theme và màu sắc.

### 6.2 File gốc mobile

| Path | Vai trò |
| --- | --- |
| `fintech-mobile/package.json` | Dependency và script Expo. |
| `fintech-mobile/package-lock.json` | Lockfile npm. |
| `fintech-mobile/tsconfig.json` | Bật strict mode và alias `@/*`. |
| `fintech-mobile/README.md` | README mặc định từ Expo template, chưa phản ánh kiến trúc mới hoàn toàn. |
| `fintech-mobile/.env` | URL backend cho web/android/ios/device thật. |
| `fintech-mobile/env.d.ts` | Khai báo type cho biến môi trường `@env`. |
| `fintech-mobile/scripts/reset-project.js` | Script reset project của Expo template. |

### 6.3 `src/app/` route layer

| File | Vai trò |
| --- | --- |
| `src/app/_layout.tsx` | Root layout; nạp font, bọc `SessionProvider`, cấu hình stack router. |
| `src/app/index.tsx` | Route `/`; chuyển tiếp sang launch/bootstrap screen. |
| `src/app/onboarding.tsx` | Route onboarding, re-export screen onboarding. |
| `src/app/(auth)/_layout.tsx` | Stack riêng cho auth flow. |
| `src/app/(auth)/login.tsx` | Route login, chỉ re-export screen login. |
| `src/app/(auth)/register.tsx` | Route register, chỉ re-export screen register. |
| `src/app/(tabs)/_layout.tsx` | Cấu hình tab bar chính cho mobile app. |
| `src/app/(tabs)/index.tsx` | Tab tổng quan/dashboard. |
| `src/app/(tabs)/transactions.tsx` | Tab giao dịch. |
| `src/app/(tabs)/wallet.tsx` | Tab ví và tài sản. |
| `src/app/(tabs)/currency.tsx` | Tab công cụ/tỷ giá. |
| `src/app/(tabs)/settings.tsx` | Tab cài đặt. |

### 6.4 `src/features/bootstrap/`

| File | Vai trò |
| --- | --- |
| `features/bootstrap/screens/launch-screen.tsx` | Splash/launch logic: chờ session provider, quyết định vào onboarding, auth hay tabs. |

### 6.5 `src/features/onboarding/`

| File | Vai trò |
| --- | --- |
| `features/onboarding/screens/onboarding-screen.tsx` | Onboarding 3 slide cho mobile, có skip/next và lưu cờ onboarding vào AsyncStorage. |

### 6.6 `src/features/auth/`

| File | Vai trò |
| --- | --- |
| `features/auth/components/auth-shell.tsx` | Layout dùng chung cho login/register. |
| `features/auth/screens/login-screen.tsx` | Màn hình đăng nhập. |
| `features/auth/screens/register-screen.tsx` | Màn hình đăng ký bám payload backend. |

### 6.7 `src/features/dashboard/`

| File | Vai trò |
| --- | --- |
| `features/dashboard/screens/home-screen.tsx` | Dashboard mobile: hero vốn khả dụng, ví, kỷ luật tài chính và giao dịch gần đây. |

### 6.8 `src/features/transactions/`

| File | Vai trò |
| --- | --- |
| `features/transactions/screens/transactions-screen.tsx` | Danh sách giao dịch có tìm kiếm, lọc theo loại và theo ví. |

### 6.9 `src/features/wallets/`

| File | Vai trò |
| --- | --- |
| `features/wallets/screens/wallets-screen.tsx` | Màn hình tổng hợp ví, hạn mức tín dụng, ngân sách và tiết kiệm gắn với ví. |

### 6.10 `src/features/tools/`

| File | Vai trò |
| --- | --- |
| `features/tools/screens/tools-screen.tsx` | Bộ chuyển đổi tiền tệ, bảng tỷ giá tham khảo và mẹo dùng app. |

### 6.11 `src/features/settings/`

| File | Vai trò |
| --- | --- |
| `features/settings/screens/settings-screen.tsx` | Màn hình cài đặt, session hiện tại, công tắc local preference, logout và replay onboarding. |

### 6.12 `src/components/ui/`

| File | Vai trò |
| --- | --- |
| `components/ui/screen.tsx` | Wrapper `SafeAreaView + ScrollView` dùng chung cho screen. |
| `components/ui/section-card.tsx` | Card có header/eyebrow/title/subtitle. |
| `components/ui/progress-bar.tsx` | Thanh tiến độ dùng cho budget/saving/credit utilization. |
| `components/ui/primary-button.tsx` | Nút chính/phụ dùng lại trong auth và onboarding. |
| `components/ui/form-field.tsx` | Input field chuẩn có icon, label, right element. |
| `components/ui/empty-state.tsx` | Empty state dùng chung. |

### 6.13 `src/components/finance/`

| File | Vai trò |
| --- | --- |
| `components/finance/wallet-card.tsx` | Card hiển thị ví theo ngữ nghĩa tiền mặt/tín dụng. |
| `components/finance/transaction-row.tsx` | Dòng giao dịch dùng chung giữa dashboard và transactions. |

### 6.14 `src/providers/`

| File | Vai trò |
| --- | --- |
| `providers/session-provider.tsx` | Session context cho toàn app: bootstrap, sign in, sign out, refresh profile, cờ onboarding. |

### 6.15 `src/services/`

| File | Vai trò |
| --- | --- |
| `services/api.ts` | Axios client trung tâm, resolve base URL theo platform, gắn JWT và bắt 401. |
| `services/auth-service.ts` | Gọi API auth/profile. |
| `services/finance-service.ts` | Gọi wallet/transaction/debt/budget/saving, chuẩn hoá response backend về type mobile. |
| `services/tools-service.ts` | Helper công cụ mobile; tỷ giá chỉ hiển thị khi có nguồn dữ liệu thật. |

### 6.16 `src/utils/`

| File | Vai trò |
| --- | --- |
| `utils/storage.ts` | Wrapper AsyncStorage cho onboarding, session, local preferences. |
| `utils/format.ts` | Format tiền, ngày, phần trăm, group transaction theo ngày, initials. |

### 6.17 `src/types/`

| File | Vai trò |
| --- | --- |
| `types/auth.ts` | Type auth/session/preferences. |
| `types/finance.ts` | Type wallet, transaction, budget, debt, saving, currency rate. |

### 6.18 `src/constants/`

| File | Vai trò |
| --- | --- |
| `constants/theme.ts` | Theme chính của mobile app: palette, spacing, radii, shadow, gradients. |
| `constants/colors.ts` | Adapter màu để giữ tương thích với tên `Colors` cũ. |

### 6.19 `src/hooks/`

| File | Vai trò |
| --- | --- |
| `hooks/useAuth.ts` | Alias hook truy cập session provider. |
| `hooks/use-theme.ts` | Trả theme chung cho app. |
| `hooks/use-color-scheme.ts` | Hook màu sáng/tối từ React Native. |
| `hooks/use-color-scheme.web.ts` | Hook riêng cho web hydration khi chạy Expo web. |

### 6.20 `src/global.css`

| File | Vai trò |
| --- | --- |
| `src/global.css` | Biến font global cho Expo web. |

### 6.21 `assets/images/`

| File | Vai trò |
| --- | --- |
| `assets/images/app-preview.png` | Ảnh preview app dùng trong onboarding. |
| `assets/images/onboarding2.png` | Ảnh slide onboarding 2. |
| `assets/images/onboarding3.png` | Ảnh slide onboarding 3. |
| `assets/images/icon.png` | App icon cơ bản. |
| `assets/images/adaptive-icon.png` | Adaptive icon cho Android. |
| `assets/images/android-icon-background.png` | Nền icon Android. |
| `assets/images/android-icon-foreground.png` | Foreground icon Android. |
| `assets/images/android-icon-monochrome.png` | Monochrome icon Android. |
| `assets/images/favicon.png` | Favicon khi chạy web. |
| `assets/images/splash-icon.png` | Splash icon dự án. |
| `assets/images/logo-glow.png` | Asset logo hiệu ứng glow. |
| `assets/images/get-started.avif` | Ảnh get-started từ template/starter. |
| `assets/images/tutorial-web.png` | Ảnh tutorial web từ template. |
| `assets/images/expo-logo.png` | Asset Expo template. |
| `assets/images/expo-badge.png` | Badge Expo template. |
| `assets/images/expo-badge-white.png` | Badge Expo template nền sáng. |
| `assets/images/react-logo.png` | Logo React 1x. |
| `assets/images/react-logo@2x.png` | Logo React 2x. |
| `assets/images/react-logo@3x.png` | Logo React 3x. |
| `assets/images/tabIcons/home.png` | Icon tab home 1x từ starter. |
| `assets/images/tabIcons/home@2x.png` | Icon tab home 2x. |
| `assets/images/tabIcons/home@3x.png` | Icon tab home 3x. |
| `assets/images/tabIcons/explore.png` | Icon explore 1x từ starter. |
| `assets/images/tabIcons/explore@2x.png` | Icon explore 2x. |
| `assets/images/tabIcons/explore@3x.png` | Icon explore 3x. |

### 6.22 `assets/expo.icon/`

| File | Vai trò |
| --- | --- |
| `assets/expo.icon/icon.json` | Metadata icon cho Expo tooling. |
| `assets/expo.icon/Assets/grid.png` | Asset phụ của Expo icon tool. |
| `assets/expo.icon/Assets/expo-symbol 2.svg` | Asset vector phụ của Expo icon tool. |

### 6.23 Mobile file cũ đã thay bằng lớp mới

- `src/app/*` hiện là route mỏng, không nên nhét thêm business logic lớn vào đây.
- Logic auth cũ dựa trên `AsyncStorage` thủ công đã được thay bằng `SessionProvider`.
- Logic gọi API cũ ở mobile không còn nên giữ endpoint sai kiểu `/wallets` hay `/transactions`; app mới dùng đúng các endpoint web/backend đang có.

---

## 7. Luồng dữ liệu chính nên đọc khi bảo trì

### Đăng nhập mobile

1. `src/app/(auth)/login.tsx`
2. `features/auth/screens/login-screen.tsx`
3. `providers/session-provider.tsx`
4. `services/auth-service.ts`
5. `services/api.ts`
6. `backend/controller/AuthController.java`
7. `backend/service/AuthService.java`

### Dashboard mobile

1. `src/app/(tabs)/index.tsx`
2. `features/dashboard/screens/home-screen.tsx`
3. `services/finance-service.ts`
4. `backend/controller/*` liên quan `wallet`, `transaction`, `budget`, `debt`, `saving`

### Dashboard web

1. `frontend/src/pages/Dashboard.jsx`
2. `frontend/src/context/*`
3. `frontend/src/services/*`
4. `backend/controller/*`

### Quên mật khẩu web

1. `frontend/src/pages/ForgotPasswordPage.jsx`
2. `frontend/src/pages/VerifyOTPPage.jsx`
3. `frontend/src/pages/ResetPasswordPage.jsx`
4. `frontend/src/services/authService.js`
5. `backend/controller/AuthController.java`
6. `backend/service/AuthService.java`
7. `backend/resources/templates/reset-password-email.html`

---

## 8. Thứ tự đọc repo nếu mới vào dự án

### Để hiểu toàn hệ thống

1. `usage.md`
2. `backend/pom.xml`
3. `backend/controller/`
4. `frontend/src/config/api.js`
5. `frontend/src/App.jsx`
6. `fintech-mobile/src/app/_layout.tsx`
7. `fintech-mobile/src/providers/session-provider.tsx`

### Để sửa mobile app

1. `fintech-mobile/src/constants/theme.ts`
2. `fintech-mobile/src/providers/session-provider.tsx`
3. `fintech-mobile/src/services/api.ts`
4. `fintech-mobile/src/services/finance-service.ts`
5. `fintech-mobile/src/features/*`
6. `fintech-mobile/src/components/*`

### Để sửa backend API

1. Controller liên quan
2. Service liên quan
3. Repository liên quan
4. DTO request/response liên quan
5. Model liên quan

---

## 9. Ghi chú bảo trì

- `backend`, `frontend` và `fintech-mobile` đang dùng naming chưa hoàn toàn đồng nhất; khi thêm API mới nên chuẩn hoá endpoint trước ở `frontend/src/config/api.js` và `fintech-mobile/src/services/finance-service.ts`.
- `fintech-mobile` hiện ưu tiên màn hình đọc dữ liệu và trải nghiệm tổng quan; CRUD đầy đủ có thể mở rộng theo cùng cấu trúc `features + services + components`.
- Nếu cài lại dependency cho mobile, nên chạy lại:

```bash
cd fintech-mobile
npm install
npx tsc --noEmit
npx expo lint
```

- Nếu cần thêm screen mới cho mobile:
  - tạo screen trong `src/features/<domain>/screens/`
  - tạo shared component nếu dùng lại
  - chỉ re-export route từ `src/app/`
  - giữ API call trong `src/services/`
  - giữ formatter/storage trong `src/utils/`
