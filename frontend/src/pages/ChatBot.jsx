import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/ChatBot.module.css';
import { Send, Bot, User, X, Paperclip, Mic } from 'lucide-react';

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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Thêm tin nhắn của user
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Giả lập phản hồi từ bot
    setTimeout(() => {
      const botResponses = [
        'Tôi có thể giúp bạn theo dõi chi tiêu, đặt mục tiêu tiết kiệm, hoặc phân tích tài chính.',
        'Bạn muốn biết thông tin về khoản chi tiêu gần đây?',
        'Tôi thấy bạn đang tiết kiệm được 12.5 triệu trong tháng này. Tuyệt vời!',
        'Bạn có muốn tôi gợi ý cách tiết kiệm hiệu quả hơn không?',
        'Hiện tại bạn đang có 3 khoản nợ cần thanh toán trong tháng này.'
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: randomResponse,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <h3>Trợ lý tài chính</h3>
            <p className={styles.botStatus}>
              <span className={styles.statusDot} />
              Đang hoạt động
            </p>
          </div>
        </div>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.chatInput}>
        <button className={styles.attachBtn}>
          <Paperclip size={18} />
        </button>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          rows={1}
        />
        <button className={styles.micBtn}>
          <Mic size={18} />
        </button>
        <button 
          className={`${styles.sendBtn} ${inputMessage.trim() ? styles.active : ''}`}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;