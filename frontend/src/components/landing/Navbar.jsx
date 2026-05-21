import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/LandingPage.module.css';
import { Wallet, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Tính năng' },
    { href: '#how-it-works', label: 'Cách hoạt động' },
    { href: '#testimonials', label: 'Đánh giá' },
    { href: '#pricing', label: 'Bảng giá' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <Wallet size={28} />
          <span>FinTrack</span>
        </Link>

        {/* Desktop Menu */}
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className={styles.navButtons}>
          <Link to="/login" className={styles.loginBtn}>
            Đăng nhập
          </Link>
          <Link to="/register" className={styles.registerBtn}>
            Đăng ký miễn phí
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className={styles.mobileAuth}>
              <Link to="/login" className={styles.mobileLogin}>
                Đăng nhập
              </Link>
              <Link to="/register" className={styles.mobileRegister}>
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
