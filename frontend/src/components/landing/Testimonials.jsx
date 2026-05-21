import React, { useState } from 'react';
import styles from '../../css/LandingPage.module.css';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Nguyễn Văn An',
      role: 'Nhân viên văn phòng',
      avatar: '/images/avatar-1.jpg',
      content: 'FinTrack giúp tôi tiết kiệm được 30% thu nhập hàng tháng. Giao diện đẹp, dễ sử dụng và báo cáo rất chi tiết.',
      rating: 5,
      saved: '12.5 triệu',
      since: '2023'
    },
    {
      name: 'Trần Thị Bích',
      role: 'Freelancer',
      avatar: '/images/avatar-2.jpg',
      content: 'Tôi quản lý thu nhập từ nhiều nguồn dễ dàng hơn bao giờ hết. Tính năng tự động phân loại giao dịch rất chính xác.',
      rating: 5,
      saved: '8.2 triệu',
      since: '2024'
    },
    {
      name: 'Lê Hoàng Nam',
      role: 'Chủ doanh nghiệp nhỏ',
      avatar: '/images/avatar-3.jpg',
      content: 'Công cụ quản lý dòng tiền và dự báo tài chính giúp tôi đưa ra quyết định kinh doanh tốt hơn.',
      rating: 5,
      saved: '45 triệu',
      since: '2023'
    },
    {
      name: 'Phạm Minh Tú',
      role: 'Kỹ sư phần mềm',
      avatar: '/images/avatar-1.jpg',
      content: 'Tính năng đầu tư thông minh với gợi ý cá nhân hóa thực sự hữu ích. Lợi nhuận từ đầu tư tăng 15% trong 3 tháng.',
      rating: 5,
      saved: '23.7 triệu',
      since: '2024'
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Đánh giá</span>
          <h2 className={styles.sectionTitle}>
            Khách hàng nói gì về{' '}
            <span className={styles.gradientText}>FinTrack</span>
          </h2>
          <p className={styles.sectionDescription}>
            Hàng ngàn người dùng đã cải thiện tình hình tài chính của họ với FinTrack.
            Đọc những câu chuyện thành công dưới đây.
          </p>
        </div>

        <div className={styles.testimonialsSlider}>
          <button 
            className={styles.sliderBtn} 
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.testimonialsContainer}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`${styles.testimonialCard} ${
                  index === currentIndex ? styles.active : ''
                } ${index === (currentIndex + 1) % testimonials.length ? styles.next : ''}`}
              >
                <Quote className={styles.quoteIcon} size={40} />
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
                <p className={styles.testimonialContent}>"{testimonial.content}"</p>
                
                <div className={styles.testimonialAuthor}>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className={styles.authorAvatar}
                  />
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>

                <div className={styles.testimonialStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{testimonial.saved}</span>
                    <span className={styles.statLabel}>Đã tiết kiệm</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{testimonial.since}</span>
                    <span className={styles.statLabel}>Sử dụng từ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className={styles.sliderBtn} 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className={styles.trustIndicators}>
          <div className={styles.trustIndicator}>
            <span className={styles.indicatorNumber}>4.8/5</span>
            <div className={styles.indicatorStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
              ))}
            </div>
            <span className={styles.indicatorLabel}>Trên 10,000+ đánh giá</span>
          </div>
          <div className={styles.trustIndicator}>
            <span className={styles.indicatorNumber}>#1</span>
            <span className={styles.indicatorLabel}>App quản lý tài chính</span>
          </div>
          <div className={styles.trustIndicator}>
            <span className={styles.indicatorNumber}>98%</span>
            <span className={styles.indicatorLabel}>Người dùng hài lòng</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
