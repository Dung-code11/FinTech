import React, { useState } from 'react';
import styles from '../../css/Header.module.css';
import { Search, Bell, Menu, Sparkles, ChevronDown, HelpCircle } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        
        <div className={styles.titleWrapper}>
          <h1 className={styles.pageTitle}>
            Những cột mốc
          </h1>
          
          {/* Coming Soon Badge for "Những cột mốc" */}
          <div className={styles.comingSoonBadge}>
            <Sparkles size={14} />
            <span>Sắp ra mắt</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div 
          className={styles.analysisWrapper}
          onMouseEnter={() => setShowComingSoon(true)}
          onMouseLeave={() => setShowComingSoon(false)}
        >
          <span className={styles.analysisText}>
            Phân tích thêm
          </span>
          <ChevronDown size={16} className={styles.analysisIcon} />
          
          {/* Tooltip cho tính năng sắp ra mắt */}
          {showComingSoon && (
            <div className={styles.comingSoonTooltip}>
              <div className={styles.tooltipContent}>
                <Sparkles size={16} />
                <div>
                  <strong>Tính năng đang phát triển</strong>
                  <p>Phân tích chi tiết sẽ sớm được cập nhật</p>
                </div>
              </div>
              <div className={styles.tooltipArrow} />
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input type="text" placeholder="Tìm kiếm giao dịch..." />
          
          {/* Search coming soon indicator */}
          <div className={styles.searchComingSoon}>
            <Sparkles size={12} />
            <span>Đang phát triển</span>
          </div>
        </div>
        
        <button className={styles.notificationBtn}>
          <Bell size={20} />
          <span className={styles.notificationBadge}>3</span>
        </button>
        
        <div className={styles.userMenu}>
          <img src="/avatar.jpg" alt="Avatar" className={styles.userAvatar} />
        </div>
      </div>
    </header>
  );
};

export default Header;