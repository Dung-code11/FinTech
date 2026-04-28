import API_ENDPOINTS from '../config/api';

const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const responseText = await response.text();

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    return { reply: responseText };
  }
};

export const aiService = {
  async chat(payload) {
    try {
      console.log('📤 Sending to backend:', {
        message: payload.message.substring(0, 50),
        activeTab: payload.activeTab,
        historyLength: payload.history?.length
      });

      const response = await fetch(API_ENDPOINTS.AI.CHAT, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || data.reply || `Lỗi ${response.status}`);
      }

      console.log('📥 Backend response:', {
        reply: (data.reply || '').substring(0, 50),
        action: data.action,
        refreshScopes: data.refreshScopes
      });

      return {
        success: true,
        data: {
          reply: data.reply || 'Mình chưa có câu trả lời phù hợp.',
          action: data.action || 'ANSWER',
          refreshScopes: Array.isArray(data.refreshScopes) ? data.refreshScopes : [],
        },
      };
    } catch (error) {
      console.error('❌ AI Service error:', error);
      return {
        success: false,
        error: error.message || 'Không thể kết nối chatbot lúc này.',
      };
    }
  },
};