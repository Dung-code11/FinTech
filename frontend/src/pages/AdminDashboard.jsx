import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import styles from '../css/AdminDashboard.module.css';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  Edit2,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Shield,
  Tags,
  Trash2,
  Users,
  Wallet,
  XCircle,
  TrendingUp
} from 'lucide-react';

const initialCategoryForm = {
  id: '',
  name: '',
  type: 'EXPENSE'
};

const normalize = (value) => String(value || '').toLowerCase();

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
  const [categoryScopeFilter, setCategoryScopeFilter] = useState('all');
  const [categoryForm, setCategoryForm] = useState({ ...initialCategoryForm });

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({ ...initialCategoryForm });
  }, []);

  const requireSuccess = useCallback((result) => {
    if (!result?.success) {
      throw new Error(result?.error || 'Request failed');
    }

    return result.data;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview': {
          const [statsResult, transactionsResult] = await Promise.all([
            adminService.getStats(),
            adminService.getTransactions()
          ]);

          setStats(requireSuccess(statsResult));
          setTransactions(requireSuccess(transactionsResult).slice(0, 10));
          break;
        }
        case 'users':
          setUsers(requireSuccess(await adminService.getUsers()));
          break;
        case 'categories':
          setCategories(requireSuccess(await adminService.getCategories()));
          break;
        default:
          break;
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, requireSuccess]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab !== 'categories') {
      resetCategoryForm();
      setCategoryTypeFilter('all');
      setCategoryScopeFilter('all');
    }
  }, [activeTab, resetCategoryForm]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const result = await adminService.toggleUserStatus(userId, !currentStatus);
    if (result.success) {
      showToast(!currentStatus ? 'Da kich hoat tai khoan' : 'Da khoa tai khoan');
      loadData();
      return;
    }

    showToast(result.error, 'error');
  };

  const handleChangeRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const result = await adminService.updateUserRole(userId, nextRole);

    if (result.success) {
      showToast(`Da doi vai tro thanh ${nextRole}`);
      loadData();
      return;
    }

    showToast(result.error, 'error');
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      showToast('Ten danh muc khong duoc de trong', 'error');
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      type: categoryForm.type,
      isDefault: true
    };

    const result = categoryForm.id
      ? await adminService.updateCategory(categoryForm.id, payload)
      : await adminService.createCategory(payload);

    if (result.success) {
      showToast(categoryForm.id ? 'Cap nhat danh muc thanh cong' : 'Tao danh muc thanh cong');
      resetCategoryForm();
      loadData();
      return;
    }

    showToast(result.error, 'error');
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name || '',
      type: category.type || 'EXPENSE'
    });
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Xoa danh muc "${category.name}"?`)) {
      return;
    }

    const result = await adminService.deleteCategory(category.id);
    if (result.success) {
      showToast('Xoa danh muc thanh cong');
      if (categoryForm.id === category.id) {
        resetCategoryForm();
      }
      loadData();
      return;
    }

    showToast(result.error, 'error');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('vi-VN');
  };

  const filteredUsers = users.filter((userItem) =>
    normalize(userItem.fullname).includes(normalize(searchQuery)) ||
    normalize(userItem.username).includes(normalize(searchQuery)) ||
    normalize(userItem.email).includes(normalize(searchQuery))
  );

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      normalize(category.name).includes(normalize(searchQuery)) ||
      normalize(category.ownerUsername).includes(normalize(searchQuery));

    const matchesType = categoryTypeFilter === 'all' || category.type === categoryTypeFilter;
    const matchesScope =
      categoryScopeFilter === 'all' ||
      (categoryScopeFilter === 'default' && category.isDefault) ||
      (categoryScopeFilter === 'custom' && !category.isDefault);

    return matchesSearch && matchesType && matchesScope;
  });

  const menuItems = [
    { id: 'overview', label: 'Tong quan', icon: <Home size={20} /> },
    { id: 'users', label: 'Nguoi dung', icon: <Users size={20} /> },
    { id: 'categories', label: 'Danh muc', icon: <Tags size={20} /> }
  ];

  const renderToolbar = (children) => (
    <div className={styles.headerActions}>
      <div className={styles.searchBar}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Tim kiem..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      {children}
      <button className={styles.refreshBtn} onClick={loadData} title="Lam moi">
        <RefreshCw size={18} />
      </button>
    </div>
  );

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Users size={24} />}
            label="Tong nguoi dung"
            value={stats.totalUsers}
            bg="#e3f2fd"
            color="#1976d2"
            trend={`${stats.totalAdmins} admin`}
          />
          <StatCard
            icon={<Wallet size={24} />}
            label="Tong vi"
            value={stats.totalWallets}
            bg="#d1fae5"
            color="#10b981"
            trend={`${stats.totalSavings} savings`}
          />
          <StatCard
            icon={<Activity size={24} />}
            label="Tong giao dich"
            value={stats.totalTransactions}
            bg="#fef3c7"
            color="#f59e0b"
            trend={`${formatCurrency(stats.avgTransaction)} trung binh`}
          />
          <StatCard
            icon={<DollarSign size={24} />}
            label="Tong thu nhap"
            value={formatCurrency(stats.totalRevenue)}
            bg="#dcfce7"
            color="#16a34a"
            trend={`${formatCurrency(stats.totalExpense)} chi`}
          />
        </div>
      )}

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Phan bo he thong</h3>
          </div>
          <div className={styles.pieChartPlaceholder}>
            <div className={styles.pieStats}>
              <div className={styles.pieItem}>
                <div className={styles.pieColor} style={{ background: '#1976d2' }} />
                <span>Nguoi dung: {stats?.totalUsers || 0}</span>
              </div>
              <div className={styles.pieItem}>
                <div className={styles.pieColor} style={{ background: '#10b981' }} />
                <span>Vi: {stats?.totalWallets || 0}</span>
              </div>
              <div className={styles.pieItem}>
                <div className={styles.pieColor} style={{ background: '#f59e0b' }} />
                <span>Giao dich: {stats?.totalTransactions || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Thu / Chi</h3>
          </div>
          <div style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                {formatCurrency(stats?.totalRevenue)}
              </span>
              <div style={{ color: '#64748b', fontSize: 12 }}>Tong thu nhap</div>
            </div>
            <div>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 20 }}>
                {formatCurrency(stats?.totalExpense)}
              </span>
              <div style={{ color: '#64748b', fontSize: 12 }}>Tong chi tieu</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h3>Giao dich gan day</h3>
        </div>

        <div className={styles.activityList}>
          {transactions.length === 0 && (
            <p style={{ padding: 20, color: '#64748b' }}>Chua co giao dich</p>
          )}

          {transactions.map((transaction) => (
            <div key={transaction.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {transaction.type === 'EXPENSE' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className={styles.activityInfo}>
                <span className={styles.activityName}>{transaction.description || 'Khong mo ta'}</span>
                <span className={styles.activityTime}>
                  {transaction.username || '-'} • {formatDate(transaction.createdAt)}
                </span>
              </div>
              <div
                className={styles.activityAmount}
                style={{ color: transaction.type === 'EXPENSE' ? '#ef4444' : '#10b981' }}
              >
                {transaction.type === 'EXPENSE' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
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
        <h2>Quan ly nguoi dung</h2>
        {renderToolbar()}
      </div>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ho ten</th>
              <th>Username</th>
              <th>Email</th>
              <th>Vai tro</th>
              <th>Trang thai</th>
              <th>So vi</th>
              <th>Giao dich</th>
              <th>Thu</th>
              <th>Chi</th>
              <th>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((userItem) => (
              <tr key={userItem.id}>
                <td>#{userItem.id?.slice(0, 6)}</td>
                <td>{userItem.fullname || '-'}</td>
                <td>{userItem.username || '-'}</td>
                <td>{userItem.email || '-'}</td>
                <td>
                  <span className={`${styles.roleBadge} ${userItem.role === 'ADMIN' ? styles.admin : styles.user}`}>
                    {userItem.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${userItem.isActived ? styles.active : styles.inactive}`}>
                    {userItem.isActived ? 'Hoat dong' : 'Khoa'}
                  </span>
                </td>
                <td>{userItem.walletCount || 0}</td>
                <td>{userItem.transactionCount || 0}</td>
                <td style={{ color: '#10b981' }}>{formatCurrency(userItem.totalIncome)}</td>
                <td style={{ color: '#ef4444' }}>{formatCurrency(userItem.totalExpense)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.editBtn}
                      title="Doi vai tro"
                      onClick={() => handleChangeRole(userItem.id, userItem.role)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={userItem.isActived ? styles.deleteBtn : styles.activateBtn}
                      title={userItem.isActived ? 'Khoa tai khoan' : 'Kich hoat tai khoan'}
                      onClick={() => handleToggleStatus(userItem.id, userItem.isActived)}
                    >
                      {userItem.isActived ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Khong tim thay nguoi dung</p>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className={styles.usersContent}>
      <div className={styles.contentHeader}>
        <h2>Quan ly danh muc</h2>
        {renderToolbar(
          <>
            <select
              className={styles.filterSelect}
              value={categoryTypeFilter}
              onChange={(event) => setCategoryTypeFilter(event.target.value)}
            >
              <option value="all">Tat ca loai</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <select
              className={styles.filterSelect}
              value={categoryScopeFilter}
              onChange={(event) => setCategoryScopeFilter(event.target.value)}
            >
              <option value="all">Tat ca pham vi</option>
              <option value="default">Mac dinh</option>
              <option value="custom">Nguoi dung</option>
            </select>
          </>
        )}
      </div>

      <form className={styles.categoryFormCard} onSubmit={handleCategorySubmit}>
        <div className={styles.categoryFormGrid}>
          <div className={styles.categoryField}>
            <label>Ten danh muc</label>
            <input
              className={styles.categoryInput}
              type="text"
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="Nhap ten danh muc"
            />
          </div>
          <div className={styles.categoryField}>
            <label>Loai</label>
            <select
              className={styles.categorySelect}
              value={categoryForm.type}
              onChange={(event) => setCategoryForm((previous) => ({ ...previous, type: event.target.value }))}
            >
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
            </select>
          </div>
        </div>

        <div className={styles.categoryFormActions}>
          <span className={styles.categoryHint}>
            Danh muc tao tu admin se duoc luu thanh danh muc mac dinh he thong.
          </span>
          <div className={styles.categoryButtons}>
            {categoryForm.id && (
              <button type="button" className={styles.filterBtn} onClick={resetCategoryForm}>
                Huy sua
              </button>
            )}
            <button type="submit" className={styles.exportBtn}>
              {categoryForm.id ? 'Cap nhat danh muc' : 'Them danh muc'}
            </button>
          </div>
        </div>
      </form>

      <div className={styles.usersTable}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ten</th>
              <th>Loai</th>
              <th>Pham vi</th>
              <th>Chu so huu</th>
              <th>Giao dich</th>
              <th>Danh muc con</th>
              <th>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>#{category.id?.slice(0, 6)}</td>
                <td>{category.name || '-'}</td>
                <td>
                  <span className={styles.roleBadge}>{category.type || '-'}</span>
                </td>
                <td>
                  <span
                    className={`${styles.scopeBadge} ${category.isDefault ? styles.defaultScope : styles.customScope}`}
                  >
                    {category.isDefault ? 'He thong' : 'Nguoi dung'}
                  </span>
                </td>
                <td>{category.ownerUsername || '-'}</td>
                <td>{category.transactionCount || 0}</td>
                <td>{category.subCategoryCount || 0}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.editBtn}
                      title="Sua danh muc"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      title="Xoa danh muc"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Khong co danh muc nao</p>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
          <div className={styles.loading}>Dang tai du lieu...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: 30, textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
          <button onClick={loadData} className={styles.exportBtn}>
            <RefreshCw size={16} /> Thu lai
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'categories':
        return renderCategories();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={styles.adminDashboard}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

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
          {menuItems.map((item) => (
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
                <p className={styles.userRole}>Quan tri vien</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            {sidebarOpen && <span>Dang xuat</span>}
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn} onClick={loadData} title="Lam moi">
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

function StatCard({ icon, label, value, bg, color, trend }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: bg, color }}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {trend && (
          <span className={styles.statTrend}>
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
