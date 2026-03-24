import API_ENDPOINTS from '../config/api';

// Helper function để xử lý response
const handleResponse = async (response) => {
    const responseText = await response.text();

    console.log('Wallet API Response:', {
        status: response.status,
        text: responseText
    });

    // Thử parse JSON nếu có thể
    try {
        return JSON.parse(responseText);
    } catch (e) {
        return { message: responseText };
    }
};

// Helper function để tạo headers với token
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

export const walletService = {
    // Lấy tất cả ví của user
    async getWallets() {
        try {
            const response = await fetch(API_ENDPOINTS.WALLET.GET_ALL, {
                method: 'GET',
                headers: createHeaders(true)
            });

            const data = await handleResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy danh sách ví');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Get wallets error:', error);
            return {
                success: false,
                error: error.message || 'Không thể lấy danh sách ví'
            };
        }
    },

    // Lấy thông tin chi tiết một ví
    async getWalletById(walletId) {
        try {
            const response = await fetch(API_ENDPOINTS.WALLET.GET_BY_ID(walletId), {
                method: 'GET',
                headers: createHeaders(true)
            });

            const data = await handleResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy thông tin ví');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Get wallet by id error:', error);
            return {
                success: false,
                error: error.message || 'Không thể lấy thông tin ví'
            };
        }
    },

    // Tạo ví mới
    async createWallet(walletData) {
        try {
            // Chuyển đổi dữ liệu từ form sang format API
            const requestData = {
                name: walletData.name,
                currency: walletData.currency,
                type: walletData.type === 'cash' ? 'CASH' : 'CREDIT',
                initialBalance: walletData.type === 'cash' ? parseFloat(walletData.initialBalance) : null,
                creditLimit: walletData.type === 'credit' ? parseFloat(walletData.creditLimit) : null,
                unpaidBalance: walletData.type === 'credit' ? parseFloat(walletData.unpaidBalance) : null,
                expiryDate: walletData.type === 'credit' ? walletData.dueDate : null
            };

            console.log('Creating wallet with data:', requestData);

            const response = await fetch(API_ENDPOINTS.WALLET.CREATE, {
                method: 'POST',
                headers: createHeaders(true),
                body: JSON.stringify(requestData)
            });

            const data = await handleResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tạo ví mới');
            }

            return {
                success: true,
                message: data.message || 'Tạo ví thành công',
                data: data
            };
        } catch (error) {
            console.error('Create wallet error:', error);
            return {
                success: false,
                error: error.message || 'Không thể tạo ví mới'
            };
        }
    },

    // Cập nhật thông tin ví
    async updateWallet(walletId, walletData) {
        try {
            const requestData = {
                name: walletData.name,
                currency: walletData.currency,
                type: walletData.type === 'cash' ? 'CASH' : 'CREDIT',
                balance: walletData.type === 'cash' ? parseFloat(walletData.initialBalance) : null,
                creditLimit: walletData.type === 'credit' ? parseFloat(walletData.creditLimit) : null,
                unpaidBalance: walletData.type === 'credit' ? parseFloat(walletData.unpaidBalance) : null,
                expiryDate: walletData.type === 'credit' ? walletData.dueDate : null
            };

            const response = await fetch(API_ENDPOINTS.WALLET.UPDATE(walletId), {
                method: 'PUT',
                headers: createHeaders(true),
                body: JSON.stringify(requestData)
            });

            const data = await handleResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật ví');
            }

            return {
                success: true,
                message: data.message || 'Cập nhật ví thành công',
                data: data
            };
        } catch (error) {
            console.error('Update wallet error:', error);
            return {
                success: false,
                error: error.message || 'Không thể cập nhật ví'
            };
        }
    },

    // Xóa ví
    async deleteWallet(walletId) {
        try {
            const response = await fetch(API_ENDPOINTS.WALLET.DELETE(walletId), {
                method: 'DELETE',
                headers: createHeaders(true)
            });

            const data = await handleResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa ví');
            }

            return {
                success: true,
                message: data.message || 'Xóa ví thành công',
                data: data
            };
        } catch (error) {
            console.error('Delete wallet error:', error);
            return {
                success: false,
                error: error.message || 'Không thể xóa ví'
            };
        }
    },

    // Format wallet response từ API sang format UI
    formatWalletForUI(walletResponse) {
        return {
            id: walletResponse.id,
            name: walletResponse.name,
            currency: walletResponse.currency,
            type: walletResponse.type === 'CASH' ? 'cash' : 'credit',
            balance: walletResponse.balance,
            creditLimit: walletResponse.creditLimit,
            unpaidBalance: walletResponse.unpaidBalance,
            expiryDate: walletResponse.expiryDate,
            // Format hiển thị
            displayBalance: walletResponse.type === 'CASH'
                ? `${walletResponse.balance?.toLocaleString()}₫`
                : `${walletResponse.creditLimit?.toLocaleString()}₫`,
            displayUnpaid: walletResponse.unpaidBalance
                ? `${walletResponse.unpaidBalance?.toLocaleString()}₫`
                : '0₫'
        };
    }
};