import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { DailyExpenseCard, WalletCard } from '../components/dashboard/StatCard';
import NetChangeCard from '../components/dashboard/NetChangeCard';
import TransactionList from '../components/dashboard/TransactionList';
import WalletDialog from '../pages/WalletDialog';
import styles from '../css/DashboardPage.module.css';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateWallet = (walletData) => {
    console.log('New wallet created:', walletData);
    // Xử lý tạo ví ở đây (gọi API, update state, etc.)
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <Header onMenuClick={toggleSidebar} />
        
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <DailyExpenseCard />
          <WalletCard onClick={() => setShowWalletDialog(true)} />
        </div>

        {/* Net Change Section */}
        <div className={styles.netChangeSection}>
          <NetChangeCard />
        </div>

        {/* Transactions */}
        <TransactionList />

        {/* Bottom Navigation (Mobile) */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Wallet Dialog */}
        <WalletDialog 
          isOpen={showWalletDialog}
          onClose={() => setShowWalletDialog(false)}
          onSave={handleCreateWallet}
        />
      </main>
    </div>
  );
};

export default HomePage;