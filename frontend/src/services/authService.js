import API_ENDPOINTS from '../config/api';

// Helper function để xử lý response
const handleResponse = async (response) => {
  const responseText = await response.text();
  
  console.log('Raw response:', {
    status: response.status,
    text: responseText
  });

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    data = { message: responseText };
  }

  if (!response.ok) {
    const error = data.message || data.error || `Lỗi ${response.status}`;
    throw new Error(error);
  }

  return data;
};

// Helper function để tạo headers
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const authService = {
  // ==================== ĐĂNG NHẬP ====================
  async login(credentials) {
    try {
      console.log('Login data:', credentials);

      // Backend yêu cầu format: { "login": "...", "password": "..." }
      const loginPayload = {
        login: credentials.account,
        password: credentials.password
      };

      console.log('Sending login payload:', loginPayload);

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(loginPayload)
      });

      const data = await handleResponse(response);
      console.log('Login response:', data);

      // Response từ BE: { 
      //   accessToken: "...", 
      //   userId: "...", 
      //   username: "admin1", 
      //   role: "USER" 
      // }

      // Lưu token
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      
      // Tạo user data từ response
      const userData = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        accessToken: data.accessToken,
        // Nếu có thể lấy email từ đâu đó, nhưng hiện tại response không có email
        email: credentials.account.includes('@') ? credentials.account : null,
        login: credentials.account // Lưu lại login gốc
      };
      
      // Lưu thông tin user
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Đăng nhập thất bại'
      };
    }
  },

  // ==================== ĐĂNG KÝ ====================
  async register(userData) {
    try {
      const registerData = {
        username: userData.username,
        password: userData.password,
        fullname: userData.fullname,
        birthday: userData.birthday,
        sex: userData.sex,
        address: userData.address || '',
        email: userData.email,
        phone: userData.phone
      };

      console.log('Sending register data:', registerData);

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(registerData)
      });

      const responseText = await response.text();
      console.log('Register raw response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || `Lỗi ${response.status}: Đăng ký thất bại`);
      }

      let responseData = {};
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      console.log('Processed register response:', responseData);

      // Giả sử response register cũng tương tự login
      const newUserData = {
        username: userData.username,
        email: userData.email,
        fullname: userData.fullname,
        phone: userData.phone,
        ...responseData
      };
      
      // Lưu token nếu có
      if (responseData.accessToken) {
        localStorage.setItem('token', responseData.accessToken);
      } else {
        // Tạo token tạm nếu không có
        const token = btoa(`${newUserData.email}-${Date.now()}`);
        localStorage.setItem('token', token);
      }
      
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      return {
        success: true,
        data: newUserData,
        message: responseData.message || 'Đăng ký thành công'
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Đăng ký thất bại'
      };
    }
  },

  // ==================== QUÊN MẬT KHẨU ====================
  async forgotPassword(email) {
    try {
      console.log('Sending forgot password request for:', email);

      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ email })
      });

      const data = await handleResponse(response);
      console.log('Forgot password response:', data);
      
      return {
        success: true,
        data: data,
        message: 'Mã OTP đã được gửi đến email của bạn'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Không thể gửi mã OTP'
      };
    }
  },

  // ==================== XÁC THỰC OTP ====================
  async verifyOTP(email, otp) {
    try {
      console.log('Verifying OTP for:', email, 'OTP:', otp);

      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ 
          email: email,
          otp: otp 
        })
      });

      const data = await handleResponse(response);
      console.log('Verify OTP response:', data);
      
      return {
        success: true,
        data: data,
        message: 'Xác thực OTP thành công'
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Mã OTP không hợp lệ'
      };
    }
  },

  // ==================== ĐẶT LẠI MẬT KHẨU ====================
  async resetPassword(email, newPassword) {
    try {
      console.log('Resetting password for:', email);

      const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ 
          email: email,
          newPassword: newPassword 
        })
      });

      const data = await handleResponse(response);
      console.log('Reset password response:', data);
      
      return {
        success: true,
        data: data,
        message: 'Đặt lại mật khẩu thành công'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Không thể đặt lại mật khẩu'
      };
    }
  },

  // ==================== ĐĂNG XUẤT ====================
  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: createHeaders(true)
        }).catch(() => {});
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Đã đăng xuất'
      };
    }
  },

  // ==================== LẤY THÔNG TIN USER ====================
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userStr || !token) {
        return {
          success: false,
          error: 'Không tìm thấy thông tin đăng nhập'
        };
      }

      return {
        success: true,
        data: JSON.parse(userStr)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể lấy thông tin user'
      };
    }
  },

  // ==================== KIỂM TRA ĐĂNG NHẬP ====================
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};