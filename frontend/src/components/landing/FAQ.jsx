import React, { useState } from 'react';
import styles from '../../css/LandingPage.module.css';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'FinTrack có miễn phí không?',
      answer: 'Có, FinTrack có gói miễn phí với đầy đủ tính năng cơ bản. Bạn có thể nâng cấp lên gói trả phí để sử dụng các tính năng nâng cao.',
    },
    {
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Tuyệt đối. FinTrack sử dụng mã hóa SSL 256-bit và tuân thủ các tiêu chuẩn bảo mật ngân hàng. Dữ liệu của bạn được bảo vệ an toàn.',
    },
    {
      question: 'Làm thế nào để kết nối với ngân hàng?',
      answer: 'Bạn chỉ cần chọn ngân hàng trong danh sách, đăng nhập bằng thông tin internet banking và xác thực OTP. Chúng tôi hỗ trợ hơn 50 ngân hàng tại Việt Nam.',
    },
    {
      question: 'Tôi có thể hủy đăng ký bất cứ lúc nào không?',
      answer: 'Có, bạn có thể hủy gói trả phí bất cứ lúc nào. Dịch vụ sẽ tiếp tục đến hết chu kỳ thanh toán hiện tại.',
    },
    {
      question: 'FinTrack có hỗ trợ đầu tư không?',
      answer: 'Có, gói Cao cấp cung cấp tính năng gợi ý đầu tư thông minh dựa trên mục tiêu và khẩu vị rủi ro của bạn.',
    },
    {
      question: 'Tôi cần hỗ trợ thì làm thế nào?',
      answer: 'Bạn có thể liên hệ qua email support@fintrack.vn, hotline 1900 1234 hoặc chat trực tiếp trên ứng dụng. Chúng tôi hỗ trợ 24/7 cho gói Cao cấp.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.faq}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>FAQ</span>
          <h2 className={styles.sectionTitle}>
            Câu hỏi thường gặp{' '}
            <span className={styles.gradientText}>(FAQ)</span>
          </h2>
          <p className={styles.sectionDescription}>
            Những câu hỏi phổ biến nhất về FinTrack. Nếu bạn có thắc mắc khác, đừng ngần ngại liên hệ với chúng tôi.
          </p>
        </div>

        <div className={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
            >
              <button 
                className={styles.faqQuestion}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`${styles.faqIcon} ${openIndex === index ? styles.rotated : ''}`} 
                />
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className={styles.moreQuestions}>
          <h3>Vẫn còn thắc mắc?</h3>
          <p>Chúng tôi sẵn sàng giải đáp mọi câu hỏi của bạn</p>
          <button className={styles.contactBtn}>
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
