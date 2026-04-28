import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../css/LandingPage.module.css';
import { Check, X, HelpCircle } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Miễn phí',
      description: 'Cho người mới bắt đầu',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { name: 'Theo dõi chi tiêu cơ bản', included: true },
        { name: 'Báo cáo thu chi', included: true },
        { name: 'Kết nối 1 ngân hàng', included: true },
        { name: 'Phân loại tự động', included: false },
        { name: 'Mục tiêu tiết kiệm', included: false },
        { name: 'Gợi ý đầu tư', included: false },
        { name: 'Hỗ trợ ưu tiên', included: false },
      ],
      buttonText: 'Bắt đầu miễn phí',
      popular: false,
      color: '#64748b'
    },
    {
      name: 'Cơ bản',
      description: 'Cho cá nhân',
      monthlyPrice: 99000,
      annualPrice: 89000,
      features: [
        { name: 'Theo dõi chi tiêu nâng cao', included: true },
        { name: 'Báo cáo chi tiết', included: true },
        { name: 'Kết nối 5 ngân hàng', included: true },
        { name: 'Phân loại tự động', included: true },
        { name: 'Mục tiêu tiết kiệm', included: true },
        { name: 'Gợi ý đầu tư', included: false },
        { name: 'Hỗ trợ ưu tiên', included: false },
      ],
      buttonText: 'Dùng thử 7 ngày',
      popular: false,
      color: '#36A2EB'
    },
    {
      name: 'Cao cấp',
      description: 'Cho chuyên gia',
      monthlyPrice: 199000,
      annualPrice: 169000,
      features: [
        { name: 'Theo dõi chi tiêu nâng cao', included: true },
        { name: 'Báo cáo chuyên sâu', included: true },
        { name: 'Kết nối không giới hạn', included: true },
        { name: 'Phân loại tự động', included: true },
        { name: 'Mục tiêu tiết kiệm', included: true },
        { name: 'Gợi ý đầu tư thông minh', included: true },
        { name: 'Hỗ trợ ưu tiên 24/7', included: true },
      ],
      buttonText: 'Dùng thử 14 ngày',
      popular: true,
      color: '#9966FF'
    },
  ];

  return (
    <section id="pricing" className={styles.pricing}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Bảng giá</span>
          <h2 className={styles.sectionTitle}>
            Lựa chọn gói phù hợp với{' '}
            <span className={styles.gradientText}>nhu cầu của bạn</span>
          </h2>
          <p className={styles.sectionDescription}>
            Tất cả các gói đều bao gồm bản dùng thử. Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={styles.billingToggle}>
          <span className={!isAnnual ? styles.active : ''}>Thanh toán tháng</span>
          <button 
            className={styles.toggleSwitch}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <span className={`${styles.toggleSlider} ${isAnnual ? styles.annual : ''}`} />
          </button>
          <span className={isAnnual ? styles.active : ''}>
            Thanh toán năm
            <span className={styles.saveBadge}>Tiết kiệm 15%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className={styles.pricingGrid}>
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>Phổ biến nhất</div>
              )}
              
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
                <div className={styles.planPrice}>
                  <span className={styles.price}>
                    {isAnnual 
                      ? plan.annualPrice.toLocaleString() 
                      : plan.monthlyPrice.toLocaleString()
                    }₫
                  </span>
                  <span className={styles.period}>/tháng</span>
                </div>
                {isAnnual && plan.annualPrice > 0 && (
                  <div className={styles.annualNote}>
                    Thanh toán {(plan.annualPrice * 12).toLocaleString()}₫/năm
                  </div>
                )}
              </div>

              <div className={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <div key={i} className={styles.featureItem}>
                    {feature.included ? (
                      <Check size={18} color={plan.color} />
                    ) : (
                      <X size={18} color="#cbd5e1" />
                    )}
                    <span className={feature.included ? '' : styles.disabled}>
                      {feature.name}
                    </span>
                    {!feature.included && (
                      <HelpCircle size={14} color="#cbd5e1" className={styles.helpIcon} />
                    )}
                  </div>
                ))}
              </div>

              <Link 
                href="/register" 
                className={`${styles.planBtn} ${plan.popular ? styles.popularBtn : ''}`}
                style={plan.popular ? { backgroundColor: plan.color } : {}}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className={styles.guarantee}>
          <div className={styles.guaranteeIcon}>🛡️</div>
          <div className={styles.guaranteeContent}>
            <h4>Cam kết hoàn tiền trong 30 ngày</h4>
            <p>Nếu bạn không hài lòng với dịch vụ, chúng tôi sẽ hoàn lại 100% số tiền bạn đã thanh toán.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
