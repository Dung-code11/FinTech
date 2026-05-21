import React from 'react';
import styles from '../../css/LandingPage.module.css';
import { 
  TrendingUp, 
  Shield, 
  Smartphone, 
  PieChart, 
  Bell, 
  CreditCard,
  Target,
  Users
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <TrendingUp size={28} />,
      title: 'Theo dõi chi tiêu',
      description: 'Tự động phân loại và theo dõi mọi khoản chi tiêu của bạn',
      color: '#FF6384'
    },
    {
      icon: <PieChart size={28} />,
      title: 'Báo cáo thông minh',
      description: 'Báo cáo chi tiết với biểu đồ trực quan, dễ hiểu',
      color: '#36A2EB'
    },
    {
      icon: <Target size={28} />,
      title: 'Mục tiêu tài chính',
      description: 'Đặt mục tiêu tiết kiệm và theo dõi tiến độ hàng ngày',
      color: '#FFCE56'
    },
    {
      icon: <Bell size={28} />,
      title: 'Nhắc nhở thông minh',
      description: 'Nhận thông báo khi đến hạn thanh toán hóa đơn',
      color: '#4BC0C0'
    },
    {
      icon: <Shield size={28} />,
      title: 'Bảo mật tuyệt đối',
      description: 'Mã hóa đầu cuối, bảo vệ thông tin tài chính của bạn',
      color: '#9966FF'
    },
    // {
    //   icon: <CreditCard size={28} />,
    //   title: 'Liên kết ngân hàng',
    //   description: 'Kết nối trực tiếp với hơn 50 ngân hàng tại Việt Nam',
    //   color: '#FF9F40'
    // },
    {
      icon: <Smartphone size={28} />,
      title: 'Đa nền tảng',
      description: 'Sử dụng trên Web, iOS và Android, đồng bộ real-time',
      color: '#FF6384'
    },
    // {
    //   icon: <Users size={28} />,
    //   title: 'Quản lý nhóm',
    //   description: 'Chia sẻ và quản lý chi tiêu chung với gia đình, bạn bè',
    //   color: '#36A2EB'
    // },
  ];

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Tính năng</span>
          <h2 className={styles.sectionTitle}>
            Mọi thứ bạn cần để{' '}
            <span className={styles.gradientText}>quản lý tài chính</span>
          </h2>
          <p className={styles.sectionDescription}>
            FinTrack cung cấp đầy đủ công cụ giúp bạn kiểm soát dòng tiền, 
            tiết kiệm thông minh và đầu tư hiệu quả.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div 
                className={styles.featureIcon}
                style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
