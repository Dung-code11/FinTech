// app/(tabs)/transactions.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import api from '../../services/api';

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
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
        {wallet && (
          <Text style={styles.transactionWallet}>{wallet.name}</Text>
        )}
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          transaction.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
    </View>
  );
};

const FilterModal = ({ visible, onClose, onApply, currentFilter }) => {
  const [type, setType] = useState(currentFilter?.type || 'all');
  const [walletId, setWalletId] = useState(currentFilter?.walletId || 'all');
  const [dateRange, setDateRange] = useState(currentFilter?.dateRange || 'all');

  const types = [
    { id: 'all', label: 'Tất cả' },
    { id: 'INCOME', label: 'Thu nhập' },
    { id: 'EXPENSE', label: 'Chi tiêu' },
  ];

  const dateRanges = [
    { id: 'all', label: 'Tất cả' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: 'Tuần này' },
    { id: 'month', label: 'Tháng này' },
    { id: 'year', label: 'Năm nay' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc giao dịch</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.filterLabel}>Loại giao dịch</Text>
            <View style={styles.filterOptions}>
              {types.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.filterChip, type === t.id && styles.filterChipActive]}
                  onPress={() => setType(t.id)}
                >
                  <Text style={[styles.filterChipText, type === t.id && styles.filterChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Thời gian</Text>
            <View style={styles.filterOptions}>
              {dateRanges.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.filterChip, dateRange === r.id && styles.filterChipActive]}
                  onPress={() => setDateRange(r.id)}
                >
                  <Text style={[styles.filterChipText, dateRange === r.id && styles.filterChipTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={() => {
              setType('all');
              setWalletId('all');
              setDateRange('all');
            }}>
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => onApply({ type, walletId, dateRange })}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState({ type: 'all', walletId: 'all', dateRange: 'all' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, searchText]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, walletsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/wallets'),
      ]);
      setTransactions(transactionsRes.data || []);
      setWallets(walletsRes.data || []);
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

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    // Filter by wallet
    if (filter.walletId !== 'all') {
      filtered = filtered.filter(t => t.walletId === filter.walletId);
    }

    // Filter by date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filter.dateRange === 'today') {
      filtered = filtered.filter(t => new Date(t.createdAt) >= today);
    } else if (filter.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.createdAt) >= weekAgo);
    } else if (filter.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(t => new Date(t.createdAt) >= monthAgo);
    } else if (filter.dateRange === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      filtered = filtered.filter(t => new Date(t.createdAt) >= yearAgo);
    }

    // Filter by search
    if (searchText.trim()) {
      filtered = filtered.filter(t => 
        t.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredTransactions(filtered);
  };

  const handleApplyFilter = (newFilter) => {
    setFilter(newFilter);
    setShowFilter(false);
  };

  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet?.name || '';
  };

  // Calculate statistics
  const stats = {
    total: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    income: filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
    expense: filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    count: filteredTransactions.length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tổng thu</Text>
                <Text style={[styles.statValue, { color: '#4caf50' }]}>
                  +{new Intl.NumberFormat('vi-VN').format(stats.income)}₫
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tổng chi</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  -{new Intl.NumberFormat('vi-VN').format(stats.expense)}₫
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Search and Filter */}
        <View style={styles.actionBar}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm giao dịch..."
              placeholderTextColor={Colors.gray400}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={Colors.gray400} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, filter.type !== 'all' && styles.filterActive]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="options-outline" size={20} color={filter.type !== 'all' ? Colors.primary : Colors.gray600} />
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredTransactions.length} giao dịch
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filter.type !== 'all' && `• ${filter.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}`}
              {filter.dateRange !== 'all' && `• ${filter.dateRange === 'today' ? 'Hôm nay' : filter.dateRange === 'week' ? 'Tuần này' : filter.dateRange === 'month' ? 'Tháng này' : 'Năm nay'}`}
            </Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.gray300} />
              <Text style={styles.emptyStateText}>Không có giao dịch nào</Text>
            </View>
          ) : (
            filteredTransactions.map(transaction => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                wallet={{ name: getWalletName(transaction.walletId) }}
              />
            ))
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilter}
        currentFilter={filter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: Colors.gray800,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterActive: {
    borderColor: Colors.primary,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray800,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 4,
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
  transactionWallet: {
    fontSize: 10,
    color: Colors.gray400,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
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
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray800,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.gray600,
  },
  filterChipTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray600,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});