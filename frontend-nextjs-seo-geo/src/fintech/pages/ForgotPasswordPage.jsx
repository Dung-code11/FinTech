import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../css/ForgotPasswordPage.module.css';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // Chuyển sang trang nhập OTP sau 1.5 giây
      setTimeout(() => {
        const message = 'Mã OTP đã được gửi đến email của bạn';
        router.push(
          `/verify-otp?email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`
        );
      }, 1500);
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className={styles.forgotPage}>
      <div className={styles.forgotCard}>
        <div className={styles.header}>
          <img src="/logo.png" alt="FinTech" className={styles.logo} />
          <h1>Quên mật khẩu?</h1>
          <p className={styles.subtitle}>
            Nhập email của bạn để nhận mã xác thực OTP
          </p>
        </div>

        {success && (
          <div className={styles.successMessage}>
            <Send size={20} />
            <span>Đã gửi mã OTP! Đang chuyển hướng...</span>
          </div>
        )}

        {errors.submit && (
          <div className={styles.errorMessage}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            icon={<Mail size={18} />}
            error={errors.email}
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            icon={<Send size={18} />}
          >
            Gửi mã OTP
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Nhớ mật khẩu? 
            <Link href="/login" className={styles.loginLink}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
