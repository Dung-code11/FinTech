// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Components
const WalletCard = ({ wallet, onPress }) => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getWalletColor = () => {
    if (wallet?.type === 'CREDIT') return '#ef4444';
    return Colors.primary;
  };

  const walletColor = getWalletColor();

  return (
    <TouchableOpacity style={styles.walletCard} onPress={onPress}>
      <View style={styles.walletHeader}>
        <Text style={styles.walletName}>{wallet?.name || 'Ví mới'}</Text>
        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.gray400} />
      </View>
      
      <View style={styles.walletContent}>
        <View style={[styles.walletIcon, { backgroundColor: `${walletColor}20` }]}>
          <Ionicons 
            name={wallet?.type === 'CREDIT' ? 'card-outline' : 'wallet-outline'} 
            size={32} 
            color={walletColor} 
          />
        </View>
        
        <View style={styles.walletDetails}>
          <Text style={styles.walletType}>
            {wallet?.type === 'CREDIT' ? 'Thẻ tín dụng' : 'Tiền mặt'}
          </Text>
          
          {wallet?.type === 'CREDIT' ? (
            <>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Hạn mức</Text>
                <Text style={styles.balanceValue}>{formatCurrency(wallet.creditLimit)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Dư nợ</Text>
                <Text style={[styles.balanceValue, { color: '#ef4444' }]}>
                  {formatCurrency(wallet.unpaidBalance || 0)}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Số dư</Text>
              <Text style={styles.balanceValue}>{formatCurrency(wallet.initialBalance || 0)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AddWalletCard = ({ onPress }) => (
  <TouchableOpacity style={[styles.walletCard, styles.addWalletCard]} onPress={onPress}>
    <View style={styles.addWalletContent}>
      <View style={styles.addWalletIcon}>
        <Ionicons name="add" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.addWalletTitle}>Thêm ví mới</Text>
      <Text style={styles.addWalletDesc}>Tạo ví mới để quản lý tài chính</Text>
    </View>
  </TouchableOpacity>
);

const NetChangeCard = ({ metrics, selectedWallet, onViewDetails }) => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0₫';
    if (Math.abs(amount) >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + 'M₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.netChangeCard}>
      <View style={styles.netChangeHeader}>
        <Text style={styles.netChangeTitle}>
          {selectedWallet ? `Biến động - ${selectedWallet.name}` : 'Thay đổi ròng'}
        </Text>
        <TouchableOpacity onPress={onViewDetails}>
          <Ionicons name="options-outline" size={20} color={Colors.gray500} />
        </TouchableOpacity>
      </View>

      <Text style={styles.netChangeValue}>{formatCurrency(metrics.net)}</Text>
      
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="arrow-down" size={16} color="#ef4444" />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Chi phí</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(metrics.expense)}</Text>
          </View>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownIcon, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="arrow-up" size={16} color={Colors.primary} />
          </View>
          <View style={styles.breakdownInfo}>
            <Text style={styles.breakdownLabel}>Thu nhập</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(metrics.income)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.detailButton} onPress={onViewDetails}>
        <Text style={styles.detailButtonText}>Xem phân tích chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const TransactionItem = ({ transaction, wallet }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) return 'Hôm nay';
    if (date >= yesterday) return 'Hôm qua';
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'INCOME' ? '#e3f2fd' : '#fee2e2' }]}>
        <Ionicons 
          name={transaction.type === 'INCOME' ? 'trending-up' : 'trending-down'} 
          size={20} 
          color={transaction.type === 'INCOME' ? Colors.primary : '#ef4444'} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{transaction.categoryName || 'Giao dịch'}</Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        transaction.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    income: 0,
    expense: 0,
    net: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [transactions, selectedWallet]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletsRes, transactionsRes] = await Promise.all([
        api.get('/wallets'),
        api.get('/transactions'),
      ]);
      setWallets(walletsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateMetrics = () => {
    let filteredTransactions = transactions;
    if (selectedWallet) {
      filteredTransactions = transactions.filter(t => t.walletId === selectedWallet.id);
    }
    
    let income = 0;
    let expense = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type === 'INCOME') {
        income += t.amount || 0;
      } else if (t.type === 'EXPENSE') {
        expense += t.amount || 0;
      }
    });
    
    setMetrics({
      income,
      expense,
      net: income - expense,
    });
  };

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(selectedWallet?.id === wallet.id ? null : wallet);
  };

  const handleAddWallet = () => {
    Alert.alert('Thông báo', 'Tính năng đang phát triển');
  };

  const handleViewDetails = () => {
    Alert.alert('Thông báo', 'Tính năng đang phát triển');
  };

  // Filter transactions for selected wallet
  const displayTransactions = selectedWallet 
    ? transactions.filter(t => t.walletId === selectedWallet.id)
    : transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.fullname || user?.username || 'Người dùng'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={44} color={Colors.gray500} />
          </TouchableOpacity>
        </View>

        {/* Wallet Grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletGrid}
        >
          {wallets.map(wallet => (
            <WalletCard 
              key={wallet.id} 
              wallet={wallet} 
              onPress={() => handleSelectWallet(wallet)}
            />
          ))}
          <AddWalletCard onPress={handleAddWallet} />
        </ScrollView>

        {/* Selected Wallet Info */}
        {selectedWallet && (
          <View style={styles.selectedWalletInfo}>
            <Text style={styles.selectedWalletTitle}>
              Đang xem: {selectedWallet.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedWallet(null)}>
              <Text style={styles.clearFilterText}>Bỏ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Net Change Card */}
        <NetChangeCard 
          metrics={metrics}
          selectedWallet={selectedWallet}
          onViewDetails={handleViewDetails}
        />

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {displayTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.gray300} />
              <Text style={styles.emptyStateText}>Chưa có giao dịch nào</Text>
            </View>
          ) : (
            displayTransactions.map(transaction => {
              const wallet = wallets.find(w => w.id === transaction.walletId);
              return (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  wallet={wallet}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray500,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray800,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  walletCard: {
    width: width * 0.75,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  addWalletCard: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray800,
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletDetails: {
    flex: 1,
  },
  walletType: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.gray500,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray800,
  },
  addWalletContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  addWalletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  addWalletTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 4,
  },
  addWalletDesc: {
    fontSize: 11,
    color: Colors.gray500,
  },
  selectedWalletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primarySoft,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  selectedWalletTitle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearFilterText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  netChangeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  netChangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  netChangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray800,
  },
  netChangeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.gray800,
    marginBottom: 20,
  },
  breakdown: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    color: Colors.gray500,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray800,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    gap: 8,
  },
  detailButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionsSection: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray800,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray800,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.gray500,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeAmount: {
    color: Colors.success,
  },
  expenseAmount: {
    color: Colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 12,
  },
});