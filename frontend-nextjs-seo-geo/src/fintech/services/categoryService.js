import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();

  console.log('Category API Response:', {
    status: response.status,
    preview: responseText.substring(0, 200)
  });

  if (!responseText || responseText.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Category parse error:', error.message);
    return { message: responseText };
  }
};

const getErrorMessage = (data, fallback) => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data && typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return fallback;
};

const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

export const categoryService = {
  async getCategories(type) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.GET_ALL(type), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể lấy danh mục'));
      }

      if (data !== null && !Array.isArray(data)) {
        throw new Error('Dữ liệu danh mục không hợp lệ');
      }

      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Get categories error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh mục',
        data: []
      };
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(categoryData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể tạo danh mục'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phản hồi tạo danh mục không hợp lệ');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create category error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo danh mục'
      };
    }
  },

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.UPDATE(categoryId), {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(categoryData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể cập nhật danh mục'));
      }

      if (!data || Array.isArray(data)) {
        throw new Error('Phản hồi cập nhật danh mục không hợp lệ');
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: false,
        error: error.message || 'Không thể cập nhật danh mục'
      };
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.DELETE(categoryId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, 'Không thể xóa danh mục'));
      }

      return {
        success: true,
        message: getErrorMessage(data, 'Xóa danh mục thành công')
      };
    } catch (error) {
      console.error('Delete category error:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa danh mục'
      };
    }
  },

  formatCategory(category) {
    return {
      id: category.id,
      name: category.categoryName || category.name || 'Không tên',
      isDefault: category.isDefault || false
    };
  }
};
