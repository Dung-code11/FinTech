import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/authService';
import Button from '../components/Button';
import styles from '../css/VerifyOTPPage.module.css';
import { Key, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

const VerifyOTPPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const message = searchParams.get('message') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60); // 60 giây countdown
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) {
      router.replace('/forgot-password');
    }
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Xử lý nhập OTP
  const handleChange = (index, value) => {
    if (value.length > 1) return; // Chỉ cho nhập 1 ký tự

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: focus ô trước
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus ô cuối cùng
      if (digits.length === 6) {
        inputRefs.current[5].focus();
      }
    }
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ submit: 'Vui lòng nhập đủ 6 số OTP' });
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateOTP()) return;

    setLoading(true);
    const otpString = otp.join('');
    const result = await authService.verifyOTP(email, otpString);
    setLoading(false);

    if (result.success) {
      const nextMessage = 'Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.';
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(
          otpString
        )}&message=${encodeURIComponent(nextMessage)}`
      );
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimer(60);
    
    const result = await authService.forgotPassword(email);
    if (!result.success) {
      setErrors({ submit: result.error });
      setCanResend(true);
    } else {
      // Reset OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  if (!email) return null;

  return (
    <div className={styles.verifyPage}>
      <div className={styles.verifyCard}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/forgot-password')}
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Key size={40} />
          </div>
          <h1>Xác thực OTP</h1>
          <p className={styles.subtitle}>
            Mã xác thực đã được gửi đến <strong>{email}</strong>
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

        <div className={styles.otpContainer}>
          <div className={styles.otpInputs}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                className={styles.otpInput}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className={styles.timer}>
            <Clock size={16} />
            <span>
              {canResend ? (
                'Bạn có thể gửi lại mã'
              ) : (
                `Gửi lại mã sau ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
              )}
            </span>
          </div>

          {canResend && (
            <button 
              className={styles.resendButton}
              onClick={handleResendOTP}
            >
              <RefreshCw size={16} />
              Gửi lại mã OTP
            </button>
          )}
        </div>

        <Button 
          onClick={handleVerify} 
          fullWidth 
          loading={loading}
        >
          Xác thực OTP
        </Button>

        <div className={styles.footer}>
          <p>
            <Link href="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
