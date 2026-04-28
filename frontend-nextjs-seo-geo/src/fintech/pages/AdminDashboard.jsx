import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import styles from '../css/AdminDashboard.module.css';
import {
  Menu, Home, Users, Wallet, TrendingUp, CreditCard,
  PiggyBank, Settings, LogOut, Bell, Search, ChevronRight,
  ArrowUpRight, ArrowDownRight, Download, Filter, RefreshCw,
  DollarSign, Activity, Shield, XCircle, CheckCircle,
  Eye, Edit2, Trash2, AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [savings, setSavings] = useState([]);

  const router = useRouter();
  const { user, logout } = useAuth();

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load data theo tab
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview': {
          const [statsRes, txRes] = await Promise.all([
            adminService.getStats(),
            adminService.getTransactions()
          ]);
          if (statsRes.success) setStats(statsRes.data);
          if (txRes.success) setTransactions(txRes.data.slice(0, 10));
          break;
        }
        case 'users': {
          const res = await adminService.getUsers();
          if (res.success) setUsers(res.data);
          break;
        }
        case 'wallets': {
          const res = await adminService.getWallets();
          if (res.success) setWallets(res.data);
          break;
        }
        case 'transactions': {
          const res = await adminService.getTransactions();
          if (res.success) setTransactions(res.data);
          break;
        }
        case 'debts': {
          const res = await adminService.getDebts();
          if (res.success) setDebts(res.data);
          break;
        }
        case 'savings': {
          const res = await adminService.getSavings();
          if (res.success) setSavings(res.data);
          break;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========== ACTIONS ==========

  const handleToggleStatus = async (userId, currentStatus) => {
    const res = await adminService.toggleUserStatus(userId, !currentStatus);
    if (res.success) {
      showToast(!currentStatus ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản');
      loadData();
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const res = await adminService.updateUserRole(userId, newRole);
    if (res.success) {
      showToast(`Đã đổi vai trò thành ${newRole}`);
      loadData();
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ========== HELPERS ==========

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredUsers = users.filter(u =>
    (u.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTx = transactions.filter(t =>
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: <Home size={20} /> },
    { id: 'users', label: 'Quản lý người dùng', icon: <Users size={20} /> },
    { id: 'wallets', label: 'Quản lý ví', icon: <Wallet size={20} /> },
    { id: 'transactions', label: 'Giao dịch', icon: <Activity size={20} /> },
    { id: 'debts', label: 'Quản lý nợ', icon: <CreditCard size={20} /> },
    { id: 'savings', label: 'Tiết kiệm', icon: <PiggyBank size={20} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
  ];

  // ========== RENDER CONTENT ==========

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard icon={<Users size={24} />} label="Tổng người dùng" value={stats.totalUsers}
            bg="#e3f2fd" color="#1976d2" trend={stats.totalAdmins + ' admin'} />
          <StatCard icon={<Wallet size={24} />} label="Tổng ví" value={stats.totalWallets}
            bg="#d1fae5" color="#10b981" trend={`${stats.totalSavings} savings`} />
          <StatCard icon={<Activity size={24} />} label="Tổng giao dịch" value={stats.totalTransactions}
            bg="#fef3c7" color="#f59e0b" trend={formatCurrency(stats.avgTransaction) + ' TB'} />
          <StatCard icon={<DollarSign size={24} />} label="Tổng thu nhập" value={formatCurrency(stats.totalRevenue)}
            bg="#dcfce7" color="#16a34a" trend={`${formatCurrency(stats.totalExpense)} chi`} />
        </div>
      )}

      {/* Charts */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Phân bố hệ thống</h3>
          </div>
          <div className={styles.pieChartPlaceholder}>
            <div className={styles.pieStats}>
              <div className={styles.pieItem}><div className={styles.pieColor} style={{ background: '#1976d2' }} /><span>Người dùng: {stats?.totalUsers || 0}</span></div>
              <div className={styles.pieItem}><div className={styles.pieColor} style={{ background: '#ef4444' }} /><span>Nợ: {stats?.totalDebts || 0}</span></div>
              <div className={styles.pieItem}><div className={styles.pieColor} style={{ background: '#10b981' }} /><span>Tiết kiệm: {stats?.totalSavings || 0}</span></div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}><h3>Thu / Chi</h3></div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                {formatCurrency(stats?.totalRevenue)}
              </span>
              <div style={{ color: '#64748b', fontSize: 12 }}>Tổng thu nhập</div>
            </div>
            <div>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 20 }}>
                {formatCurrency(stats?.totalExpense)}
              </span>
              <div style={{ color: '#64748b', fontSize: 12 }}>Tổng chi tiêu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h3>Giao dịch gần đây</h3>
          <button className={styles.viewAllBtn} onClick={() => setActiveTab('transactions')}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.activityList}>
          {transactions.length === 0 && <p style={{ padding: 20, color: '#64748b' }}>Chưa có giao dịch</p>}
          {transactions.map(t => (
            <div key={t.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {t.type === 'EXPENSE' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className={styles.activityInfo}>
                <span className={styles.activityName}>{t.description || 'Không mô tả'}</span>
                <span className={styles.activityTime}>{t.username} • {formatDate(t.createdAt)}</span>
              </div>
              <div className={styles.activityAmount} style={{ color: t.type === 'EXPENSE' ? '#ef4444' : '#10b981' }}>
                {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quản lý người dùng</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className={styles.filterBtn}><Filter size={18} /> Lọc</button>
          <button className={styles.exportBtn}><Download size={18} /> Xuất Excel</button>
          <button className={styles.refreshBtn} onClick={loadData}><RefreshCw size={18} /></button>
        </div>
      </div>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Họ tên</th><th>Username</th><th>Email</th>
              <th>Vai trò</th><th>Trạng thái</th><th>Số ví</th><th>Giao dịch</th><th>Thu</th><th>Chi</th><th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>#{u.id?.slice(0, 6)}</td>
                <td>{u.fullname || '-'}</td>
                <td>{u.username}</td>
                <td>{u.email || '-'}</td>
                <td>
                  <span className={`${styles.roleBadge} ${u.role === 'ADMIN' ? styles.admin : styles.user}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${u.isActived ? styles.active : styles.inactive}`}>
                    {u.isActived ? 'Hoạt động' : 'Khóa'}
                  </span>
                </td>
                <td>{u.walletCount || 0}</td>
                <td>{u.transactionCount || 0}</td>
                <td style={{ color: '#10b981' }}>{formatCurrency(u.totalIncome)}</td>
                <td style={{ color: '#ef4444' }}>{formatCurrency(u.totalExpense)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.viewBtn} title="Xem chi tiết"><Eye size={16} /></button>
                    <button className={styles.editBtn} title="Đổi vai trò"
                      onClick={() => handleChangeRole(u.id, u.role)}><Edit2 size={16} /></button>
                    <button
                      className={u.isActived ? styles.deleteBtn : styles.activateBtn}
                      title={u.isActived ? 'Khóa tài khoản' : 'Kích hoạt'}
                      onClick={() => handleToggleStatus(u.id, u.isActived)}>
                      {u.isActived ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Không tìm thấy người dùng</p>
        )}
      </div>
    </div>
  );

  const renderWallets = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quản lý ví</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className={styles.refreshBtn} onClick={loadData}><RefreshCw size={18} /></button>
        </div>
      </div>
      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr><th>ID</th><th>Tên ví</th><th>Loại</th><th>Số dư</th><th>Chủ ví</th><th>Role</th></tr>
          </thead>
          <tbody>
            {wallets.filter(w =>
              (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (w.username || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map(w => (
              <tr key={w.id}>
                <td>#{w.id?.slice(0, 6)}</td>
                <td>{w.name}</td>
                <td><span className={styles.roleBadge}>{w.type}</span></td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(w.initialBalance)}</td>
                <td>{w.username}</td>
                <td><span className={`${styles.roleBadge} ${w.userRole === 'ADMIN' ? styles.admin : ''}`}>{w.userRole}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {wallets.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Không có ví nào</p>}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quản lý giao dịch</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className={styles.filterBtn}><Filter size={18} /> Lọc</button>
          <button className={styles.refreshBtn} onClick={loadData}><RefreshCw size={18} /></button>
        </div>
      </div>
      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr><th>ID</th><th>Loại</th><th>Số tiền</th><th>Mô tả</th><th>Danh mục</th><th>Ví</th><th>User</th><th>Ngày</th></tr>
          </thead>
          <tbody>
            {filteredTx.map(t => (
              <tr key={t.id}>
                <td>#{t.id?.slice(0, 6)}</td>
                <td>
                  <span style={{
                    color: t.type === 'EXPENSE' ? '#ef4444' : '#10b981',
                    fontWeight: 600
                  }}>{t.type}</span>
                </td>
                <td style={{ fontWeight: 600, color: t.type === 'EXPENSE' ? '#ef4444' : '#10b981' }}>
                  {formatCurrency(t.amount)}
                </td>
                <td>{t.description || '-'}</td>
                <td>{t.categoryName || '-'}</td>
                <td>{t.walletName || '-'}</td>
                <td>{t.username || '-'}</td>
                <td>{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTx.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Không có giao dịch</p>}
      </div>
    </div>
  );

  const renderDebts = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quản lý nợ</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className={styles.refreshBtn} onClick={loadData}><RefreshCw size={18} /></button>
        </div>
      </div>
      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr><th>ID</th><th>Tên</th><th>Tổng</th><th>Còn lại</th><th>Ngày tạo</th><th>Ngày đến hạn</th><th>Chủ nợ</th></tr>
          </thead>
          <tbody>
            {debts.filter(d =>
              (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (d.username || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map(d => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td>{d.name}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(d.totalAmount)}</td>
                <td style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(d.remainingAmount)}</td>
                <td>{formatDate(d.createdDate)}</td>
                <td>{formatDate(d.targetDate)}</td>
                <td>{d.username || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {debts.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Không có khoản nợ</p>}
      </div>
    </div>
  );

  const renderSavings = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quản lý tiết kiệm</h2>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className={styles.refreshBtn} onClick={loadData}><RefreshCw size={18} /></button>
        </div>
      </div>
      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr><th>ID</th><th>Tiêu đề</th><th>Loại</th><th>Mục tiêu</th><th>Hiện tại</th><th>Trạng thái</th><th>Chủ TK</th></tr>
          </thead>
          <tbody>
            {savings.filter(s =>
              (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (s.username || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map(s => (
              <tr key={s.id}>
                <td>#{s.id?.slice(0, 6)}</td>
                <td>{s.title}</td>
                <td><span className={styles.roleBadge}>{s.type}</span></td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(s.targetAmount)}</td>
                <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(s.currentAmount)}</td>
                <td><span className={`${styles.statusBadge} ${s.status === 'ACTIVE' ? styles.active : styles.inactive}`}>{s.status}</span></td>
                <td>{s.username || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {savings.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Không có khoản tiết kiệm</p>}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.overviewContent}>
      <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>
        <Settings size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
        <h3>Cài đặt hệ thống</h3>
        <p>Tính năng đang được phát triển</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      </div>
    );

    if (error) return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
        <button onClick={loadData} className={styles.exportBtn}><RefreshCw size={16} /> Thử lại</button>
      </div>
    );

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'wallets': return renderWallets();
      case 'transactions': return renderTransactions();
      case 'debts': return renderDebts();
      case 'savings': return renderSavings();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className={styles.adminDashboard}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Shield size={28} />
            {sidebarOpen && <span>Admin Portal</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={styles.toggleBtn}>
            <Menu size={20} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.fullname || user?.username || 'Admin'}</p>
                <p className={styles.userRole}>Quản trị viên</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn} onClick={loadData} title="Làm mới">
              <RefreshCw size={20} />
            </button>
            <div className={styles.adminInfo}>
              <span>{user?.fullname || user?.username || 'Admin'}</span>
              <div className={styles.adminAvatar}>
                {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// StatCard helper
function StatCard({ icon, label, value, bg, color, trend }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: bg, color }}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {trend && <span className={styles.statTrend}><TrendingUp size={14} />{trend}</span>}
      </div>
    </div>
  );
}

export default AdminDashboard;
