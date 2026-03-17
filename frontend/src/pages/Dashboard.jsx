import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import HomePage from './HomePage';
import TransactionsPage from './TransactionsPage';
import CurrencyToolsPage from './CurrencyToolsPage';
import ChatBot from '../pages/ChatBot';
import styles from '../css/DashboardPage.module.css';
import { MessageCircle, X } from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Function để render component dựa vào activeTab
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'currency':
        return <CurrencyToolsPage />;
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
        <div className={styles.content}>
          {renderContent()}
        </div>

        {/* Floating Chat Button */}
        <button 
          className={`${styles.chatButton} ${showChat ? styles.active : ''}`}
          onClick={toggleChat}
        >
          {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        {/* Chat Window */}
        {showChat && (
          <div className={styles.chatWindow}>
            <ChatBot onClose={() => setShowChat(false)} />
          </div>
        )}

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </main>
    </div>
  );
};

export default Dashboard;