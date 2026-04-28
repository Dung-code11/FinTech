import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../css/RegisterPage.module.css';
import { User, Mail, Lock, Phone, Calendar, MapPin, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    sex: 'NAM',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { register, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Tên đăng nhập ít nhất 4 ký tự';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Vui lòng chọn ngày sinh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = formData;
    
    const result = await register(registerData);
    
    if (result.success) {
      setRegisterSuccess(true);
      // Tự động chuyển về login sau 2 giây
      setTimeout(() => {
        const message = 'Đăng ký thành công! Vui lòng đăng nhập.';
        router.push(
          `/login?message=${encodeURIComponent(message)}&account=${encodeURIComponent(formData.username)}`
        );
      }, 2000);
    } else {
      setErrors({ submit: result.error });
    }
  };

  if (registerSuccess) {
    return (
      <div className={styles.registerPage}>
        <div className={styles.successCard}>
          <CheckCircle size={60} color="#4caf50" />
          <h2>Đăng ký thành công!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản FinTech.</p>
          <p>Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...</p>
          <Link href="/login" className={styles.loginNowBtn}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <img src="/logo.png" alt="FinTech" className={styles.logo} />
          <h1>Đăng ký tài khoản</h1>
          <p className={styles.subtitle}>Tham gia FinTech ngay hôm nay</p>
        </div>

        {errors.submit && (
          <div className={styles.errorMessage}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Username */}
          <Input
            label="Tên đăng nhập"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập tên đăng nhập"
            icon={<User size={18} />}
            error={errors.username}
          />

          {/* Fullname */}
          <Input
            label="Họ và tên"
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Nhập họ tên đầy đủ"
            icon={<User size={18} />}
            error={errors.fullname}
          />

          {/* Email & Phone - 2 cột */}
          <div className={styles.row}>
            <div className={styles.col}>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                icon={<Mail size={18} />}
                error={errors.email}
              />
            </div>
            <div className={styles.col}>
              <Input
                label="Số điện thoại"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                icon={<Phone size={18} />}
                error={errors.phone}
              />
            </div>
          </div>

          {/* Password & Confirm - 2 cột */}
          <div className={styles.row}>
            <div className={styles.col}>
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
            </div>
            <div className={styles.col}>
              <Input
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
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
            </div>
          </div>

          {/* Birthday & Sex - 2 cột */}
          <div className={styles.row}>
            <div className={styles.col}>
              <Input
                label="Ngày sinh"
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                icon={<Calendar size={18} />}
                error={errors.birthday}
              />
            </div>
            <div className={styles.col}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Giới tính</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="sex"
                      value="NAM"
                      checked={formData.sex === 'NAM'}
                      onChange={handleChange}
                    />
                    <span>Nam</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="sex"
                      value="NỮ"
                      checked={formData.sex === 'NỮ'}
                      onChange={handleChange}
                    />
                    <span>Nữ</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="sex"
                      value="KHÁC"
                      checked={formData.sex === 'KHÁC'}
                      onChange={handleChange}
                    />
                    <span>Khác</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <Input
            label="Địa chỉ"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ của bạn"
            icon={<MapPin size={18} />}
            error={errors.address}
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            icon={<UserPlus size={18} />}
          >
            Đăng ký
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Đã có tài khoản? 
            <Link href="/login" className={styles.loginLink}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
