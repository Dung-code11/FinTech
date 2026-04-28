import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../css/ResetPasswordPage.module.css';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp, message } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false
  });

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  // Kiểm tra độ mạnh mật khẩu
  useEffect(() => {
    setPasswordStrength({
      minLength: formData.password.length >= 8,
      hasNumber: /[0-9]/.test(formData.password),
      hasSpecial: /[!@#$%^&*]/.test(formData.password)
    });
  }, [formData.password]);

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

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 số';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const result = await authService.resetPassword(email, otp, formData.password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' 
          } 
        });
      }, 3000);
    } else {
      setErrors({ submit: result.error });
    }
  };

  if (!email || !otp) return null;

  if (success) {
    return (
      <div className={styles.resetPage}>
        <div className={styles.successCard}>
          <CheckCircle size={60} color="#4caf50" />
          <h2>Đặt lại mật khẩu thành công!</h2>
          <p>Mật khẩu của bạn đã được cập nhật.</p>
          <p>Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetPage}>
      <div className={styles.resetCard}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/verify-otp', { state: { email } })}
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <div className={styles.header}>
          <img src="/logo.png" alt="FinTech" className={styles.logo} />
          <h1>Đặt mật khẩu mới</h1>
          <p className={styles.subtitle}>
            Vui lòng nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
          </p>
        </div>

        {message && (
          <div className={styles.infoMessage}>
            {message}
          </div>
        )}

        {errors.submit && (
          <div className={styles.errorMessage}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới"
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

          {/* Password strength indicators */}
          {formData.password && (
            <div className={styles.passwordRequirements}>
              <p className={styles.requirementsTitle}>Mật khẩu phải bao gồm:</p>
              <ul className={styles.requirementsList}>
                <li className={passwordStrength.minLength ? styles.valid : ''}>
                  {passwordStrength.minLength ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Ít nhất 8 ký tự
                </li>
                <li className={passwordStrength.hasNumber ? styles.valid : ''}>
                  {passwordStrength.hasNumber ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Ít nhất 1 số
                </li>
                <li className={passwordStrength.hasSpecial ? styles.valid : ''}>
                  {passwordStrength.hasSpecial ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
                </li>
              </ul>
            </div>
          )}

          <Input
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu mới"
            icon={<Lock size={18} />}
            error={errors.confirmPassword}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
          >
            Đặt lại mật khẩu
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;