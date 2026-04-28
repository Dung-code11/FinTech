import API_ENDPOINTS from '../config/api';

const handleResponse = async (response) => {
  const responseText = await response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { message: responseText };
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

export const subCategoryService = {
  // Lấy danh sách subcategory theo categoryId
  async getSubCategories(categoryId) {
    try {
      const response = await fetch(API_ENDPOINTS.SUB_CATEGORY.GET_BY_CATEGORY(categoryId), {
        method: 'GET',
        headers: createHeaders(true)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách danh mục con');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get subcategories error:', error);
      return {
        success: false,
        error: error.message || 'Không thể lấy danh sách danh mục con'
      };
    }
  },

  // Tạo subcategory mới
  async createSubCategory(subCategoryData) {
    try {
      const response = await fetch(API_ENDPOINTS.SUB_CATEGORY.CREATE, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(subCategoryData)
      });

      const data = await handleResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo danh mục con');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Create subcategory error:', error);
      return {
        success: false,
        error: error.message || 'Không thể tạo danh mục con'
      };
    }
  },

  // Xóa subcategory
  async deleteSubCategory(subCategoryId) {
    try {
      const response = await fetch(API_ENDPOINTS.SUB_CATEGORY.DELETE(subCategoryId), {
        method: 'DELETE',
        headers: createHeaders(true)
      });

      if (!response.ok) {
        const data = await handleResponse(response);
        throw new Error(data.message || 'Không thể xóa danh mục con');
      }

      return {
        success: true,
        message: 'Xóa danh mục con thành công'
      };
    } catch (error) {
      console.error('Delete subcategory error:', error);
      return {
        success: false,
        error: error.message || 'Không thể xóa danh mục con'
      };
    }
  },

  // Format subcategory response
  formatSubCategory(subCategory) {
    return {
      id: subCategory.id,
      name: subCategory.name,
      categoryId: subCategory.categoryId
    };
  }
};