import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Bot,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
  Moon,
  Sun,
  Globe,
  BellOff,
  BellRing,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Shield,
  Smartphone,
  Key,
  Mail,
  UserCircle,
  Database,
  Cloud,
  Settings,
  Palette,
  Languages,
  MessageCircle,
  HelpCircle,
  FileText,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getAppSettings,
  resetAppSettings,
  saveAppSettings,
} from '../services/appSettingsService';
import styles from '../css/SettingsPage.module.css';

const TAB_OPTIONS = [
  { id: 'home', label: 'Trang chủ', icon: LayoutDashboard },
  { id: 'transactions', label: 'Giao dịch', icon: CreditCard },
  { id: 'currency', label: 'Công cụ', icon: TrendingUp },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const THEMES = [
  { id: 'light', name: 'Sáng', icon: Sun, color: '#f59e0b' },
  { id: 'dark', name: 'Tối', icon: Moon, color: '#6366f1' },
  { id: 'system', name: 'Theo hệ thống', icon: Smartphone, color: '#10b981' },
];

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

const CURRENCIES = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const SettingsPage = ({ settings, onSettingsChange, onNavigateToTab }) => {
  const navigate = useNavigate();
  const { user, logout, refreshProfile, getDisplayName, getRole } = useAuth();
  const [formData, setFormData] = useState(() => settings || getAppSettings());
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('account');

  useEffect(() => {
    setFormData(settings || getAppSettings());
  }, [settings]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedSettings = saveAppSettings(formData);
      onSettingsChange?.(savedSettings);
      setMessage({ type: 'success', text: '✅ Đã lưu cài đặt thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Có lỗi xảy ra, vui lòng thử lại!' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      const defaultSettings = resetAppSettings();
      setFormData(defaultSettings);
      onSettingsChange?.(defaultSettings);
      setMessage({ type: 'success', text: '🔄 Đã khôi phục cài đặt mặc định!' });
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      const result = await refreshProfile();
      if (result.success) {
        setMessage({ type: 'success', text: '🔄 Đã đồng bộ thông tin tài khoản!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Không thể đồng bộ thông tin!' });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

  const sections = [
    { id: 'account', label: 'Tài khoản', icon: UserCircle, color: '#3b82f6' },
    { id: 'appearance', label: 'Giao diện', icon: Palette, color: '#8b5cf6' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#10b981' },
    { id: 'chatbot', label: 'Chatbot', icon: Bot, color: '#f59e0b' },
    { id: 'security', label: 'Bảo mật', icon: Shield, color: '#ef4444' },
    { id: 'preferences', label: 'Tuỳ chỉnh', icon: Settings, color: '#6b7280' },
  ];

  return (
    <div className={styles.settingsPage}>
      {/* Header với gradient */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <Settings size={28} />
            Cài đặt
          </h1>
          <p className={styles.pageDescription}>
            Tuỳ chỉnh ứng dụng để phù hợp với bạn
          </p>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={`${styles.secondaryBtn} ${styles.resetBtn}`} 
            onClick={handleReset} 
            type="button"
          >
            <RotateCcw size={16} />
            Mặc định
          </button>
          <button 
            className={`${styles.primaryBtn} ${saving ? styles.loading : ''}`} 
            disabled={saving} 
            onClick={handleSave} 
            type="button"
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {message.text && (
        <div className={`${styles.notice} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className={styles.settingsContainer}>
        {/* Sidebar navigation */}
        <div className={styles.settingsSidebar}>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`${styles.sidebarItem} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <section.icon size={20} style={{ color: section.color }} />
              <span>{section.label}</span>
              <ChevronRight size={16} className={styles.chevron} />
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={styles.settingsContent}>
          {/* Tài khoản */}
          {activeSection === 'account' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#3b82f620', color: '#3b82f6' }}>
                  <User size={20} />
                </div>
                <div>
                  <h2>Thông tin tài khoản</h2>
                  <p>Quản lý thông tin cá nhân và phiên đăng nhập</p>
                </div>
              </div>

              <div className={styles.profileSection}>
                <div className={styles.avatar}>
                  <UserCircle size={64} />
                  <button className={styles.changeAvatarBtn} type="button">
                    Thay đổi
                  </button>
                </div>
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <User size={16} />
                    <span>Tên hiển thị</span>
                    <strong>{getDisplayName()}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <Mail size={16} />
                    <span>Email</span>
                    <strong>{user?.email || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <Shield size={16} />
                    <span>Vai trò</span>
                    <strong className={styles.badge}>{getRole()}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.actionGroup}>
                <button 
                  className={styles.secondaryBtn} 
                  disabled={refreshing} 
                  onClick={handleRefreshProfile} 
                  type="button"
                >
                  <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                  {refreshing ? 'Đang đồng bộ...' : 'Đồng bộ thông tin'}
                </button>
                <button 
                  className={styles.secondaryBtn} 
                  onClick={() => navigate('/forgot-password')} 
                  type="button"
                >
                  <Key size={16} />
                  Đổi mật khẩu
                </button>
                <button className={styles.dangerBtn} onClick={handleLogout} type="button">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </section>
          )}

          {/* Giao diện */}
          {activeSection === 'appearance' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                  <Palette size={20} />
                </div>
                <div>
                  <h2>Giao diện</h2>
                  <p>Tuỳ chỉnh màu sắc và hiển thị</p>
                </div>
              </div>

              <label className={styles.field}>
                <span>Chủ đề màu</span>
                <div className={styles.themeOptions}>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      className={`${styles.themeOption} ${formData.theme === theme.id ? styles.active : ''}`}
                      onClick={() => handleChange({ target: { name: 'theme', value: theme.id } })}
                      type="button"
                    >
                      <theme.icon size={24} style={{ color: theme.color }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </label>

              <label className={styles.field}>
                <span>Ngôn ngữ</span>
                <div className={styles.languageOptions}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={`${styles.languageOption} ${formData.language === lang.code ? styles.active : ''}`}
                      onClick={() => handleChange({ target: { name: 'language', value: lang.code } })}
                      type="button"
                    >
                      <span className={styles.flag}>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </label>

              <label className={styles.field}>
                <span>Đơn vị tiền tệ</span>
                <select
                  className={styles.select}
                  name="currency"
                  onChange={handleChange}
                  value={formData.currency || 'VND'}
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </label>
            </section>
          )}

          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#10b98120', color: '#10b981' }}>
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2>Dashboard</h2>
                  <p>Tuỳ chỉnh trang chính của bạn</p>
                </div>
              </div>

              <label className={styles.field}>
                <span>Tab mặc định</span>
                <select
                  className={styles.select}
                  name="defaultTab"
                  onChange={handleChange}
                  value={formData.defaultTab}
                >
                  {TAB_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Nhớ tab gần nhất</strong>
                  <p>Mở lại đúng màn hình bạn dùng lần trước</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.rememberLastTab}
                    name="rememberLastTab"
                    onChange={handleChange}
                    type="checkbox"
                    id="rememberLastTab"
                  />
                  <label htmlFor="rememberLastTab" />
                </div>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Hiển thị số dư</strong>
                  <p>Ẩn/hiện số dư trên dashboard để bảo mật</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.showBalance !== false}
                    name="showBalance"
                    onChange={handleChange}
                    type="checkbox"
                    id="showBalance"
                  />
                  <label htmlFor="showBalance" />
                </div>
              </label>

              <div className={styles.actionGroup}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => onNavigateToTab?.(formData.defaultTab)}
                  type="button"
                >
                  <LayoutDashboard size={16} />
                  Mở dashboard
                </button>
              </div>
            </section>
          )}

          {/* Chatbot */}
          {activeSection === 'chatbot' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h2>Trợ lý AI</h2>
                  <p>Tuỳ chỉnh cách chatbot hoạt động</p>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Hiển thị nút chatbot</strong>
                  <p>Hiển thị nút chat ở góc phải màn hình</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.showChatButton}
                    name="showChatButton"
                    onChange={handleChange}
                    type="checkbox"
                    id="showChatButton"
                  />
                  <label htmlFor="showChatButton" />
                </div>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Gợi ý nhanh</strong>
                  <p>Hiển thị các câu hỏi mẫu khi mở chatbot</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.showQuickPrompts}
                    name="showQuickPrompts"
                    onChange={handleChange}
                    type="checkbox"
                    id="showQuickPrompts"
                  />
                  <label htmlFor="showQuickPrompts" />
                </div>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Thông báo từ AI</strong>
                  <p>Nhận thông báo gợi ý từ trợ lý AI</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.aiNotifications}
                    name="aiNotifications"
                    onChange={handleChange}
                    type="checkbox"
                    id="aiNotifications"
                  />
                  <label htmlFor="aiNotifications" />
                </div>
              </label>
            </section>
          )}

          {/* Bảo mật */}
          {activeSection === 'security' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#ef444420', color: '#ef4444' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h2>Bảo mật</h2>
                  <p>Quản lý các thiết lập bảo mật</p>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Xác thực 2 lớp</strong>
                  <p>Tăng cường bảo mật cho tài khoản</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.twoFactorAuth}
                    name="twoFactorAuth"
                    onChange={handleChange}
                    type="checkbox"
                    id="twoFactorAuth"
                  />
                  <label htmlFor="twoFactorAuth" />
                </div>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Thông báo đăng nhập</strong>
                  <p>Nhận email khi có đăng nhập mới</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.loginNotifications}
                    name="loginNotifications"
                    onChange={handleChange}
                    type="checkbox"
                    id="loginNotifications"
                  />
                  <label htmlFor="loginNotifications" />
                </div>
              </label>

              <div className={styles.securityInfo}>
                <div className={styles.infoItem}>
                  <Lock size={16} />
                  <span>Lần đổi mật khẩu gần nhất</span>
                  <strong>{user?.lastPasswordChange || 'Chưa đổi'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <Smartphone size={16} />
                  <span>Thiết bị đang dùng</span>
                  <strong>{navigator.userAgent.split(' ').slice(-2).join(' ')}</strong>
                </div>
              </div>

              <button className={styles.secondaryBtn} type="button">
                <Eye size={16} />
                Xem lịch sử đăng nhập
              </button>
            </section>
          )}

          {/* Tuỳ chỉnh */}
          {activeSection === 'preferences' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: '#6b728020', color: '#6b7280' }}>
                  <Settings size={20} />
                </div>
                <div>
                  <h2>Tuỳ chỉnh khác</h2>
                  <p>Các thiết lập bổ sung</p>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Chế độ ngoại tuyến</strong>
                  <p>Cho phép làm việc khi không có kết nối internet</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.offlineMode}
                    name="offlineMode"
                    onChange={handleChange}
                    type="checkbox"
                    id="offlineMode"
                  />
                  <label htmlFor="offlineMode" />
                </div>
              </label>

              <label className={styles.toggleRow}>
                <div>
                  <strong>Tự động backup</strong>
                  <p>Tự động sao lưu dữ liệu hàng ngày</p>
                </div>
                <div className={styles.toggle}>
                  <input
                    checked={formData.autoBackup}
                    name="autoBackup"
                    onChange={handleChange}
                    type="checkbox"
                    id="autoBackup"
                  />
                  <label htmlFor="autoBackup" />
                </div>
              </label>

              <div className={styles.actionGroup}>
                <button className={styles.secondaryBtn} type="button">
                  <Database size={16} />
                  Xuất dữ liệu
                </button>
                <button className={styles.secondaryBtn} type="button">
                  <Cloud size={16} />
                  Đồng bộ đám mây
                </button>
              </div>

              <div className={styles.about}>
                <h3>Về ứng dụng</h3>
                <p>Phiên bản 2.0.0</p>
                <p>© 2024 FinTrack App. Tất cả các quyền được bảo lưu.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
