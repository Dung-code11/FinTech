import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/LandingPage.module.css';
import { ArrowRight, Check, Star } from 'lucide-react';
import getstartedimg from "../../assets/images/get-started.avif"
const CTASection = () => {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <span className={styles.ctaBadge}>Bắt đầu ngay</span>
            <h2 className={styles.ctaTitle}>
              Sẵn sàng kiểm soát tài chính của bạn?
            </h2>
            <p className={styles.ctaDescription}>
              Tham gia cùng hơn 1 triệu người dùng đang quản lý tài chính thông minh với FinTrack.
              Hoàn toàn miễn phí, không cần thẻ tín dụng.
            </p>

            <div className={styles.ctaFeatures}>
              <div className={styles.ctaFeature}>
                <Check size={16} />
                <span>Miễn phí trọn đời</span>
              </div>
              <div className={styles.ctaFeature}>
                <Check size={16} />
                <span>Không cam kết</span>
              </div>
              <div className={styles.ctaFeature}>
                <Check size={16} />
                <span>Hủy bất cứ lúc nào</span>
              </div>
            </div>

            <div className={styles.ctaButtons}>
              <Link to="/register" className={styles.ctaPrimaryBtn}>
                Tạo tài khoản miễn phí
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className={styles.ctaSecondaryBtn}>
                Đăng nhập
              </Link>
            </div>

            <div className={styles.ctaRating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
                ))}
              </div>
              <span className={styles.ratingText}>
                <strong>4.8/5</strong> từ hơn 10,000+ đánh giá
              </span>
            </div>
          </div>

          <div className={styles.ctaVisual}>
            <img src={getstartedimg} alt="Get Started" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
