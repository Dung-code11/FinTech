import React from 'react';
import styles from '../../css/LandingPage.module.css';
import { UserPlus, Download, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import Appreviewimg from "../../assets/images/app-preview.png"
const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus size={32} />,
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản miễn phí trong 30 giây với email hoặc số điện thoại',
      color: '#FF6384'
    },
    // {
    //   icon: <Download size={32} />,
    //   title: 'Kết nối ngân hàng',
    //   description: 'Liên kết tài khoản ngân hàng để tự động đồng bộ giao dịch',
    //   color: '#36A2EB'
    // },
    {
      icon: <Wallet size={32} />,
      title: 'Theo dõi chi tiêu',
      description: 'Xem báo cáo chi tiết và phân tích thói quen chi tiêu',
      color: '#FFCE56'
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Đầu tư thông minh',
      description: 'Nhận gợi ý đầu tư cá nhân hóa dựa trên mục tiêu của bạn',
      color: '#4BC0C0'
    },
  ];

  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Cách hoạt động</span>
          <h2 className={styles.sectionTitle}>
            Bắt đầu chỉ với{' '}
            <span className={styles.gradientText}>4 bước đơn giản</span>
          </h2>
          <p className={styles.sectionDescription}>
            FinTrack được thiết kế để dễ sử dụng, ngay cả với người mới bắt đầu.
            Hãy làm theo các bước dưới đây để bắt đầu hành trình tài chính của bạn.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <div 
                  className={styles.stepIcon}
                  style={{ backgroundColor: `${step.color}20`, color: step.color }}
                >
                  {step.icon}
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.stepArrow}>
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Demo Video/Image */}
        <div className={styles.demoSection}>
          <div className={styles.demoContent}>
            <h3>Xem FinTrack trong action</h3>
            <p>Khám phá cách ứng dụng giúp bạn quản lý tài chính hiệu quả</p>
            <button className={styles.demoBtn}>
              Xem demo
              <ArrowRight size={16} />
            </button>
          </div>
          <div className={styles.demoImage}>
            <img src={Appreviewimg} alt="App Preview" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
