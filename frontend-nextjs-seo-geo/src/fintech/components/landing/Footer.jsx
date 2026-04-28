import React from 'react';
import Link from 'next/link';
import styles from '../../css/LandingPage.module.css';
import { 
  Wallet, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Tính năng', href: '#features' },
      { label: 'Bảng giá', href: '#pricing' },
      { label: 'Cách hoạt động', href: '#how-it-works' },
      { label: 'Tải ứng dụng', href: '/download' },
    ],
    company: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Tuyển dụng', href: '/careers' },
    ],
    support: [
      { label: 'Trung tâm trợ giúp', href: '/help' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Blog', href: '/blog' },
    ],
  };

  const socialLinks = [
    { icon: <Facebook size={18} />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter size={18} />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Linkedin size={18} />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Instagram size={18} />, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer */}
        <div className={styles.footerMain}>
          {/* Brand Column */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Wallet size={32} />
              <span>FinTech</span>
            </div>
            <p className={styles.brandDescription}>
              Giải pháp quản lý tài chính thông minh, giúp bạn kiểm soát dòng tiền, 
              tiết kiệm và đầu tư hiệu quả.
            </p>
            
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>support@fintech.vn</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>1900 1234</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h4>Sản phẩm</h4>
              <ul>
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>
                      <ChevronRight size={14} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4>Công ty</h4>
              <ul>
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href}>
                      <ChevronRight size={14} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4>Hỗ trợ</h4>
              <ul>
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href}>
                      <ChevronRight size={14} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.footerNewsletter}>
            <h4>Đăng ký nhận tin</h4>
            <p>Nhận thông tin mới nhất về tính năng và ưu đãi</p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterBtn}>
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {currentYear} FinTech. All rights reserved.
          </div>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
