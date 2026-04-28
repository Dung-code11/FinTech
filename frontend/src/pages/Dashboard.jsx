import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import HomePage from '../pages/HomePage';
import TransactionsPage from '../pages/TransactionsPage';
import CurrencyToolsPage from '../pages/CurrencyToolsPage';
import BudgetPage from '../pages/BudgetPage';
import DebtPage from '../pages/DebtPage';
import SavingsPage from '../pages/SavingsPage';
import AdminDashboard from '../pages/AdminDashboard';
import SettingsPage from '../pages/SettingsPage';
import ChatBot from '../pages/ChatBot';
import {
  clearLastDashboardTab,
  getAppSettings,
  resolveInitialDashboardTab,
  setLastDashboardTab,
} from '../services/appSettingsService';
import styles from '../css/DashboardPage.module.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appSettings, setAppSettings] = useState(() => getAppSettings());
  const [activeTab, setActiveTab] = useState(() => resolveInitialDashboardTab());
  const [chatOpen, setChatOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingsChange = (nextSettings) => {
    setAppSettings(nextSettings);

    if (!nextSettings.rememberLastTab) {
      clearLastDashboardTab();
    }

    if (!nextSettings.showChatButton) {
      setChatOpen(false);
    }
  };

  useEffect(() => {
    if (appSettings.rememberLastTab) {
      setLastDashboardTab(activeTab);
    }
  }, [activeTab, appSettings.rememberLastTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'currency':
        return <CurrencyToolsPage onTabChange={handleTabChange} />;
      case 'budget':
        return <BudgetPage embedded />;
      case 'debt':
        return <DebtPage embedded />;
      case 'savings':
        return <SavingsPage embedded />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return (
          <SettingsPage
            onNavigateToTab={handleTabChange}
            onSettingsChange={handleSettingsChange}
            settings={appSettings}
          />
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className={styles.mainContent}>
        <div className={styles.content}>{renderContent()}</div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </main>

      {appSettings.showChatButton && chatOpen ? (
        <div className={styles.chatWindow}>
          <ChatBot
            activeTab={activeTab}
            onClose={() => setChatOpen(false)}
            showQuickPrompts={appSettings.showQuickPrompts}
          />
        </div>
      ) : null}

      {appSettings.showChatButton ? (
        <button
          className={`${styles.chatButton} ${chatOpen ? styles.active : ''}`}
          onClick={() => setChatOpen((previous) => !previous)}
          type="button"
        >
          {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      ) : null}
    </div>
  );
};

export default Dashboard;
