import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Sidebar.module.css";
import {
  Home,
  RefreshCw,
  PieChart,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Wallet,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle, activeTab, onTabChange }) => {
  const { user, logout, getDisplayName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "home", icon: <Home size={20} />, label: "Trang chủ" },
    { id: "transactions", icon: <RefreshCw size={20} />, label: "Giao dịch" },
    { id: "currency", icon: <PieChart size={20} />, label: "Công cụ tiền tệ" },
    { id: "settings", icon: <Settings size={20} />, label: "Cài đặt" },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${!isOpen ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logo} onClick={!isOpen ? onToggle : undefined}>
          <Wallet size={24} />
          {isOpen && <span>FinTech</span>}
        </div>

        {isOpen && (
          <button onClick={onToggle} className={styles.sidebarToggle}>
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.fullname?.charAt(0) || user?.username?.charAt(0) || "U"}
          </div>
          {isOpen && (
            <div className={styles.userDetails}>
              <p className={styles.userName}>{getDisplayName()}</p>
              <p className={styles.userEmail}>
                {user?.email || "user@fintech.com"}
              </p>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
