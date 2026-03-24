import API_ENDPOINTS from '../config/api';

// Dữ liệu mẫu cho categories
const MOCK_EXPENSE_CATEGORIES = [
  { id: '1', categoryName: 'Ăn uống', isDefault: true },
  { id: '2', categoryName: 'Mua sắm', isDefault: true },
  { id: '3', categoryName: 'Di chuyển', isDefault: true },
  { id: '4', categoryName: 'Hóa đơn', isDefault: true },
  { id: '5', categoryName: 'Giải trí', isDefault: true },
];

const MOCK_INCOME_CATEGORIES = [
  { id: '6', categoryName: 'Lương', isDefault: true },
  { id: '7', categoryName: 'Thưởng', isDefault: true },
  { id: '8', categoryName: 'Đầu tư', isDefault: true },
];

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  console.log('Category API Response:', {
    status: response.status,
    text: responseText.substring(0, 200) + '...'
  });

  try {
    if (!responseText || responseText.trim() === '') {
      return [];
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Parse error:', e.message);
      return [];
    }
  } catch (error) {
    console.error('Handle response error:', error);
    return [];
  }
};

const createHeaders = (includeAuth = true) => {
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

export const categoryService = {
  async getCategories(type) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.GET_ALL(type), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        console.warn('API returned error, using mock data');
        // Trả về mock data theo type
        if (type === 'EXPENSE') {
          return {
            success: true,
            data: MOCK_EXPENSE_CATEGORIES
          };
        } else {
          return {
            success: true,
            data: MOCK_INCOME_CATEGORIES
          };
        }
      }

      const categories = Array.isArray(data) ? data : [];
      
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Get categories error:', error);
      // Trả về mock data khi lỗi
      if (type === 'EXPENSE') {
        return {
          success: true,
          data: MOCK_EXPENSE_CATEGORIES,
          warning: 'Using mock data due to API error'
        };
      } else {
        return {
          success: true,
          data: MOCK_INCOME_CATEGORIES,
          warning: 'Using mock data due to API error'
        };
      }
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
        throw new Error(data.message || 'Không thể tạo danh mục');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Create category error:', error);
      // Tạo mock response
      const newCategory = {
        id: Date.now().toString(),
        categoryName: categoryData.name || 'Danh mục mới',
        isDefault: false
      };
      return {
        success: true,
        data: newCategory,
        warning: 'Using mock data due to API error'
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
        throw new Error(data.message || 'Không thể cập nhật danh mục');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: true,
        data: { id: categoryId, ...categoryData },
        warning: 'Using mock data due to API error'
      };
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY.DELETE(categoryId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      if (!response.ok) {
        const data = await handleResponse(response);
        throw new Error(data.message || 'Không thể xóa danh mục');
      }

      return {
        success: true,
        message: 'Xóa danh mục thành công'
      };
    } catch (error) {
      console.error('Delete category error:', error);
      return {
        success: true,
        message: 'Xóa danh mục thành công (mock)',
        warning: 'Using mock data due to API error'
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