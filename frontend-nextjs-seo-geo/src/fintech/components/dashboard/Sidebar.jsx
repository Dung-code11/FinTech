import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import styles from "../../css/Sidebar.module.css";
import {
  Home,
  RefreshCw,
  PieChart,
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
  Shield,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle, activeTab, onTabChange }) => {
  const { user, logout, getDisplayName, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const menuItems = [
    { id: "home", icon: <Home size={20} />, label: "Trang chủ", path: "/dashboard" },
    { id: "transactions", icon: <RefreshCw size={20} />, label: "Giao dịch", path: "/dashboard" },
    { id: "currency", icon: <PieChart size={20} />, label: "Công cụ tiền tệ", path: "/dashboard" },
  ];

  if (isAdmin()) {
    menuItems.push({
      id: "admin",
      icon: <Shield size={20} />,
      label: "Quản trị",
      path: "/admin/dashboard",
    });
  }

  menuItems.push({
    id: "settings",
    icon: <Settings size={20} />,
    label: "Cài đặt",
    path: "/dashboard",
  });

  const handleNavigation = (item) => {
    onTabChange(item.id);
    router.push(item.path);
  };

  const isItemActive = (itemId) => {
    if (itemId === "currency") {
      return ["currency", "budget", "debt", "savings"].includes(activeTab);
    }

    return activeTab === itemId;
  };

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
            className={`${styles.navItem} ${isItemActive(item.id) ? styles.active : ""}`}
            onClick={() => handleNavigation(item)}
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
              {isAdmin() && <span className={styles.adminBadge}>Admin</span>}
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
