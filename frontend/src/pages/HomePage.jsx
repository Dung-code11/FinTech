import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { WalletGrid, DailyExpenseCard } from '../components/dashboard/StatCard';
import NetChangeCard from '../components/dashboard/NetChangeCard';
import TransactionList from '../components/dashboard/TransactionList';
import WalletDialog from '../pages/WalletDialog';
import styles from '../css/DashboardPage.module.css';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('all'); // State để lưu ví được chọn
  const { user } = useAuth();
  const { wallets, loadWallets } = useWallet();
  const { transactions, loadTransactions } = useTransaction();

  useEffect(() => {
    loadWallets();
    loadTransactions();
  }, []);

  // Debug: Xem dữ liệu wallets và transactions
  useEffect(() => {
    console.log('HomePage - Wallets:', wallets);
    console.log('HomePage - Transactions:', transactions);
  }, [wallets, transactions]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateWallet = async (walletData) => {
    console.log('Creating wallet:', walletData);
    setShowWalletDialog(false);
    await loadWallets();
  };

  const handleSelectWallet = (wallet) => {
    console.log('Selected wallet:', wallet);
    setSelectedWallet(wallet.id); // Cập nhật state khi chọn ví
  };

  const handleViewDetails = () => {
    console.log('View details for wallet:', selectedWallet);
    // TODO: Navigate to detailed analytics page
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.mainContent}>
        <Header onMenuClick={toggleSidebar} />        
        {/* Wallet Grid */}
        <WalletGrid 
          wallets={wallets}
          transactions={transactions}
          onAddWallet={() => setShowWalletDialog(true)}
          onSelectWallet={handleSelectWallet}
        />

        {/* Net Change Section */}
        <div className={styles.netChangeSection}>
          <NetChangeCard 
            transactions={transactions}
            wallets={wallets}
            selectedWalletId={selectedWallet}
            onViewDetails={handleViewDetails}
          />
        </div>

        {/* Transactions - TRUYỀN selectedWallet vào đây */}
        <TransactionList 
          transactions={transactions}
          wallets={wallets}
          selectedWalletId={selectedWallet}
        />

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