import React from 'react';
import styles from '../css/Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  const buttonClasses = [
    styles.btn,
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    fullWidth ? styles.btnFull : '',
    loading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <span className={styles.btnLoading}>
          <span className={styles.spinner}></span>
          Đang xử lý...
        </span>
      ) : (
        <span className={styles.btnContent}>
          {icon && <span className={styles.btnIcon}>{icon}</span>}
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;