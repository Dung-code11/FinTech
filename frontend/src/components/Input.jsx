import React from 'react';
import styles from '../css/Input.module.css';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  icon,
  rightIcon,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && <label htmlFor={name} className={styles.inputLabel}>{label}</label>}
      <div className={`${styles.inputContainer} ${error ? styles.error : ''}`}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${styles.inputField} ${icon ? styles.withIcon : ''} ${rightIcon ? styles.withRightIcon : ''}`}
          {...props}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
};

export default Input;