import React from 'react';
import styles from '../../css/BottomNav.module.css';
import { Home, RefreshCw, PieChart, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Trang chủ' },
    { id: 'transactions', icon: <RefreshCw size={20} />, label: 'Giao dịch' },
    { id: 'currency', icon: <PieChart size={20} />, label: 'Công cụ' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt' },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;