import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/ChatBot.module.css';
import { Send, Bot, User, X, Paperclip, Mic, RefreshCw } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Xin chào! Tôi là trợ lý tài chính của bạn. Tôi có thể giúp gì cho bạn?',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hàm gọi API chat
  const sendMessageToAI = async (message) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_ENDPOINTS.AI?.CHAT || 'http://localhost:8080/api/ai/chat'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.reply || data.message || 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn.';
    } catch (error) {
      console.error('Chat API error:', error);
      return 'Xin lỗi, có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại sau.';
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (loading) return;

    // Thêm tin nhắn của user
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    const userQuestion = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Gọi API
    const reply = await sendMessageToAI(userQuestion);
    
    // Thêm phản hồi từ bot
    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: reply,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatBot}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.botAvatar}>
            <Bot size={20} />
          </div>
          <div className={styles.headerInfo}>
            <h3>Trợ lý tài chính AI</h3>
            <p className={styles.botStatus}>
              <span className={`${styles.statusDot} ${loading ? styles.loading : ''}`} />
              {loading ? 'Đang suy nghĩ...' : 'Sẵn sàng'}
            </p>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages.map(message => (
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
        
        {isTyping && (
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
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>Đóng</button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.chatInput}>
        <button className={styles.attachBtn} disabled={loading}>
          <Paperclip size={18} />
        </button>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={loading ? "Đang chờ phản hồi..." : "Nhập tin nhắn..."}
          rows={1}
          disabled={loading}
        />
        <button className={styles.micBtn} disabled={loading}>
          <Mic size={18} />
        </button>
        <button 
          className={`${styles.sendBtn} ${inputMessage.trim() && !loading ? styles.active : ''}`}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
        >
          {loading ? <RefreshCw size={18} className={styles.spinner} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;