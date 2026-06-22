import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';
import styles from '../css/VerifyOTPPage.module.css';
import { Key, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, message } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const canResend = timer === 0;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    const nextValue = value.replace(/\D/g, '');
    if (nextValue.length > 1) return;

    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);

    if (nextValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const nextOtp = [...otp];
    digits.forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);

    inputRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ submit: 'Vui long nhap du 6 so OTP' });
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
      navigate('/reset-password', {
        state: {
          email,
          otp: otpString,
          message: 'Xac thuc OTP thanh cong. Vui long dat mat khau moi.'
        }
      });
    } else {
      setErrors({ submit: result.error });
    }
  };

  const handleResendOTP = async () => {
    setErrors({});
    setTimer(60);

    const result = await authService.forgotPassword(email);
    if (!result.success) {
      setErrors({ submit: result.error });
      setTimer(0);
      return;
    }

    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  if (!email) return null;

  return (
    <div className={styles.verifyPage}>
      <div className={styles.verifyCard}>
        <button
          className={styles.backButton}
          onClick={() => navigate('/forgot-password')}
        >
          <ArrowLeft size={20} />
          Quay lai
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Key size={40} />
          </div>
          <h1>Xac thuc OTP</h1>
          <p className={styles.subtitle}>
            Ma xac thuc da duoc gui den <strong>{email}</strong>
          </p>
        </div>

        {message && <div className={styles.infoMessage}>{message}</div>}
        {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}

        <div className={styles.otpContainer}>
          <div className={styles.otpInputs}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                ref={(element) => (inputRefs.current[index] = element)}
                className={styles.otpInput}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className={styles.timer}>
            <Clock size={16} />
            <span>
              {canResend
                ? 'Ban co the gui lai ma'
                : `Gui lai ma sau ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
            </span>
          </div>

          {canResend && (
            <button
              className={styles.resendButton}
              onClick={handleResendOTP}
            >
              <RefreshCw size={16} />
              Gui lai ma OTP
            </button>
          )}
        </div>

        <Button onClick={handleVerify} fullWidth loading={loading}>
          Xac thuc OTP
        </Button>

        <div className={styles.footer}>
          <p>
            <Link to="/login">Quay lai dang nhap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
