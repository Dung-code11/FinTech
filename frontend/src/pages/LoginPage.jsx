import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../css/LoginPage.module.css';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    account: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.account.trim()) {
      newErrors.account = 'Vui lòng nhập tên đăng nhập hoặc email';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login({
      account: formData.account,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ 
        submit: result.error,
        details: result.details 
      });
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <img src="/logo.png" alt="FinTech" className={styles.logo} />
          <h1>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại với FinTech</p>
        </div>

        {errors.submit && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            <div className={styles.errorContent}>
              <strong>Lỗi:</strong> {errors.submit}
              {errors.details && (
                <button 
                  className={styles.debugToggle}
                  onClick={() => setShowDebug(!showDebug)}
                >
                  Chi tiết
                </button>
              )}
            </div>
          </div>
        )}

        {showDebug && errors.details && (
          <div className={styles.debugInfo}>
            <strong>Debug info:</strong>
            <pre>{errors.details}</pre>
            <div className={styles.debugHelp}>
              <p>🔧 Kiểm tra:</p>
              <ul>
                <li>Backend đang chạy ở port 8080?</li>
                <li>API endpoint đúng chưa? (/api/auth/login)</li>
                <li>CORS đã được cấu hình?</li>
                <li>Username/password chính xác?</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Tên đăng nhập / Email"
            type="text"
            name="account"
            value={formData.account}
            onChange={handleChange}
            placeholder="Nhập tên đăng nhập hoặc email"
            icon={<User size={18} />}
            error={errors.account}
          />

          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
            icon={<Lock size={18} />}
            error={errors.password}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            icon={<LogIn size={18} />}
          >
            Đăng nhập
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Chưa có tài khoản? 
            <Link to="/register" className={styles.registerLink}>
              Đăng ký ngay →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;