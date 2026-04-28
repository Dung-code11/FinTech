import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../css/ChatBot.module.css';
import { Send, Bot, User, X, Sparkles, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import { useDebt } from '../context/DebtContext';
import { useSavings } from '../context/SavingsContext';

const QUICK_PROMPTS = {
  home: [
    'Tổng quan tài chính tháng này của tôi',
    'Ví nào đang còn bao nhiêu tiền?',
    'Ngân sách nào sắp vượt mức?',
  ],
  transactions: [
    'Ghi giúp tôi ăn trưa 45k',
    '5 giao dịch gần nhất',
    'Tháng này tôi đang chi nhiều vào đâu?',
  ],
  currency: [
    'Tiết kiệm và nợ của tôi hiện ra sao?',
    'Dự đoán đến cuối tháng',
    'Có khoản chi nào đang lặp lại nhiều không?',
  ],
  admin: [
    'Tổng quan tài chính cá nhân của tôi',
    'Gợi ý điều tôi nên chú ý nhất lúc này',
    'Tháng này dòng tiền của tôi đang thế nào?',
  ],
  default: [
    'Tổng quan tài chính tháng này',
    '5 giao dịch gần nhất',
    'Dự đoán đến cuối tháng',
  ],
};

const TAB_TITLES = {
  home: 'Trang chủ',
  transactions: 'Giao dịch',
  currency: 'Công cụ',
  admin: 'Quản trị',
  settings: 'Cài đặt',
};

const createMessage = (type, text) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  text,
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
});

const createWelcomeMessage = (activeTab) =>
  createMessage(
    'bot',
    `Xin chào, mình là trợ lý tài chính AI của bạn.\nBạn đang ở ${TAB_TITLES[activeTab] || 'FinTech'}.\nHãy hỏi mình về ví, giao dịch, ngân sách, tiết kiệm, nợ hoặc nhập thẳng một khoản thu/chi để mình ghi lại.`,
  );

const ChatBot = ({ onClose, activeTab, showQuickPrompts = true }) => {
  const [messages, setMessages] = useState(() => [createWelcomeMessage(activeTab)]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Thêm refs để kiểm soát refresh
  const refreshTimeoutRef = useRef(null);
  const lastRefreshTimeRef = useRef(0);
  const pendingScopesRef = useRef(new Set());
  
  const { loadWallets } = useWallet();
  const { loadTransactions } = useTransaction();
  const { loadDebts } = useDebt();
  const { loadSavings } = useSavings();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Debounced refresh function
  const debouncedRefresh = useCallback(async (scopes) => {
    // Clear previous timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Add to pending scopes
    scopes.forEach(scope => pendingScopesRef.current.add(scope));
    
    // Set new timeout
    refreshTimeoutRef.current = setTimeout(async () => {
      const scopesToRefresh = Array.from(pendingScopesRef.current);
      pendingScopesRef.current.clear();
      
      // Check cooldown (2 seconds)
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < 2000) {
        console.log('⏱️ Skipping refresh - cooldown period');
        return;
      }
      
      lastRefreshTimeRef.current = now;
      
      console.log('🔄 Refreshing data for scopes:', scopesToRefresh);
      
      const tasks = [];
      if (scopesToRefresh.includes('wallets')) tasks.push(loadWallets());
      if (scopesToRefresh.includes('transactions')) tasks.push(loadTransactions());
      if (scopesToRefresh.includes('debts')) tasks.push(loadDebts());
      if (scopesToRefresh.includes('savings')) tasks.push(loadSavings());
      
      if (tasks.length > 0) {
        await Promise.allSettled(tasks);
        console.log('✅ Data refresh completed');
      }
    }, 500); // Debounce 500ms
  }, [loadWallets, loadTransactions, loadDebts, loadSavings]);

  const refreshData = async (refreshScopes) => {
    const scopes = [...new Set(refreshScopes || [])];
    if (scopes.length === 0) return;
    
    await debouncedRefresh(scopes);
  };

  // Kiểm tra xem câu nói có phải là hành động ghi dữ liệu không
  const isWriteAction = (text) => {
    const writeKeywords = [
      'thêm', 'tạo', 'xóa', 'sửa', 'cập nhật', 'ghi', 'record', 'add', 'delete', 'update',
      'insert', 'remove', 'edit', 'modify', 'xóa ví', 'thêm ví', 'tạo ví',
      'xóa giao dịch', 'thêm giao dịch', 'sửa giao dịch'
    ];
    return writeKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const sendMessage = async (presetMessage) => {
    const nextText = (presetMessage ?? inputMessage).trim();
    if (!nextText || loading) return;

    const userMessage = createMessage('user', nextText);
    const nextHistory = [...messages, userMessage]
      .slice(-8)
      .map((message) => ({
        role: message.type === 'bot' ? 'assistant' : 'user',
        text: message.text,
      }));

    setMessages((previous) => [...previous, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    const result = await aiService.chat({
      message: nextText,
      activeTab,
      history: nextHistory,
    });

    if (!result.success) {
      setError(result.error);
      setMessages((previous) => [
        ...previous,
        createMessage('bot', 'Xin lỗi, mình chưa kết nối được tới chatbot. Bạn thử lại sau ít phút.'),
      ]);
      setLoading(false);
      return;
    }

    setMessages((previous) => [...previous, createMessage('bot', result.data.reply)]);
    
    // Debug: Xem backend trả về gì
    console.log('🔍 Backend response:', {
      refreshScopes: result.data.refreshScopes,
      action: result.data.action,
      isWriteAction: isWriteAction(nextText)
    });
    
    // CHỈ refresh khi có hành động ghi dữ liệu VÀ backend báo cần refresh
    const needsRefresh = isWriteAction(nextText) && 
                         result.data.refreshScopes && 
                         result.data.refreshScopes.length > 0;
    
    if (needsRefresh) {
      console.log('📝 Write action detected, refreshing data...');
      await refreshData(result.data.refreshScopes);
    } else if (result.data.refreshScopes && result.data.refreshScopes.length > 0) {
      console.log('👀 Read action or no changes, skipping refresh');
    }
    
    setLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !loading) {
      event.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = QUICK_PROMPTS[activeTab] || QUICK_PROMPTS.default;

  return (
    <div className={styles.chatBot}>
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.botAvatar}>
            <Bot size={20} />
          </div>
          <div className={styles.headerInfo}>
            <h3>Trợ lý tài chính AI</h3>
            <p className={styles.botStatus}>
              <span className={`${styles.statusDot} ${loading ? styles.loading : ''}`} />
              {loading ? 'Đang xử lý...' : 'Sẵn sàng'}
            </p>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          <X size={20} />
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 1 && showQuickPrompts ? (
          <div className={styles.hintCard}>
            <div className={styles.hintTitle}>
              <Sparkles size={16} />
              Gợi ý theo {TAB_TITLES[activeTab] || 'màn hiện tại'}
            </div>
            <div className={styles.quickActions}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className={styles.quickActionBtn}
                  disabled={loading}
                  onClick={() => sendMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageWrapper} ${styles[message.type]}`}
          >
            {message.type === 'bot' && (
              <div className={styles.messageAvatar}>
                <Bot size={16} />
              </div>
            )}
            <div className={styles.messageContent}>
              <div className={styles.messageBubble}>
                <p>{message.text}</p>
              </div>
              <span className={styles.messageTime}>{message.time}</span>
            </div>
            {message.type === 'user' && (
              <div className={styles.messageAvatar}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading ? (
          <div className={`${styles.messageWrapper} ${styles.bot}`}>
            <div className={styles.messageAvatar}>
              <Bot size={16} />
            </div>
            <div className={styles.messageContent}>
              <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className={styles.errorMessage}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} type="button">
              Đóng
            </button>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <textarea
          value={inputMessage}
          onChange={(event) => setInputMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Đang chờ phản hồi...' : 'Nhập câu hỏi hoặc khoản thu/chi...'}
          rows={1}
          disabled={loading}
        />
        <button
          className={`${styles.sendBtn} ${inputMessage.trim() && !loading ? styles.active : ''}`}
          onClick={() => sendMessage()}
          disabled={!inputMessage.trim() || loading}
          type="button"
        >
          {loading ? <RefreshCw size={18} className={styles.spinner} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;