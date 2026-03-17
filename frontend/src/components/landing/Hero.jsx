import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/LandingPage.module.css';
import { ArrowRight, TrendingUp, Shield, Zap, Star, Users, DollarSign } from 'lucide-react';
import heroDashboardImg from '../../assets/images/hero-dashboard.jpg';
const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          {/* Badge */}
          <div className={styles.heroBadge} data-aos="fade-up">
            <Zap size={18} />
            <span>Quản lý tài chính thông minh hơn với AI</span>
          </div>

          {/* Main Heading */}
          <h1 className={styles.heroTitle} data-aos="fade-up" data-aos-delay="100">
            Kiểm soát tài chính của bạn{' '}
            <span className={styles.gradientText}>một cách thông minh</span>
          </h1>

          {/* Description */}
          <p className={styles.heroDescription} data-aos="fade-up" data-aos-delay="200">
            FinTech giúp bạn theo dõi chi tiêu, tiết kiệm và đầu tư hiệu quả. 
            Tất cả trong một ứng dụng duy nhất, hoàn toàn miễn phí.
          </p>

          {/* CTA Buttons */}
          <div className={styles.heroButtons} data-aos="fade-up" data-aos-delay="300">
            <Link to="/register" className={styles.primaryBtn}>
              Bắt đầu ngay
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className={styles.secondaryBtn}>
              Khám phá thêm
            </a>
          </div>

          {/* Stats */}
          <div className={styles.heroStats} data-aos="fade-up" data-aos-delay="400">
            <div className={styles.statItem}>
              <Users size={20} className={styles.statIcon} />
              <div>
                <span className={styles.statNumber}>1M+</span>
                <span className={styles.statLabel}>Người dùng</span>
              </div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <DollarSign size={20} className={styles.statIcon} />
              <div>
                <span className={styles.statNumber}>₫50B+</span>
                <span className={styles.statLabel}>Giao dịch</span>
              </div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <Star size={20} className={styles.statIcon} fill="#FFB800" color="#FFB800" />
              <div>
                <span className={styles.statNumber}>4.8★</span>
                <span className={styles.statLabel}>Đánh giá</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges} data-aos="fade-up" data-aos-delay="500">
            <div className={styles.trustItem}>
              <Shield size={16} />
              <span>Bảo mật SSL 256-bit</span>
            </div>
            <div className={styles.trustItem}>
              <TrendingUp size={16} />
              <span>Được cấp phép bởi NHNN</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual} data-aos="fade-left" data-aos-delay="200">
          <div className={styles.heroImageWrapper}>
              <img 
              src={heroDashboardImg} 
              alt="FinTech Dashboard Preview"
              className={styles.heroImage}
            />
            
            {/* Floating Cards */}
            <div className={`${styles.floatingCard} ${styles.card1}`}>
              <span className={styles.cardIcon}>💰</span>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Tiết kiệm</span>
                <span className={styles.cardValue}>+12.5%</span>
              </div>
            </div>
            
            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <span className={styles.cardIcon}>📊</span>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Đầu tư</span>
                <span className={styles.cardValue}>₫45.2M</span>
              </div>
            </div>
            
            <div className={`${styles.floatingCard} ${styles.card3}`}>
              <span className={styles.cardIcon}>🎯</span>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>Mục tiêu</span>
                <span className={styles.cardValue}>78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>
    </section>
  );
};

export default Hero;