import api from './api';

import type {
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  SessionUser,
} from '@/types/auth';

function buildUserFromResponse(response: LoginResponse, loginHint: string): SessionUser {
  return {
    id: response.userId,
    username: response.username,
    role: response.role,
    email: loginHint.includes('@') ? loginHint.toLowerCase() : null,
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);

    return {
      token: data.accessToken,
      user: buildUserFromResponse(data, credentials.login),
    };
  },

  async register(payload: RegisterPayload) {
    await api.post('/auth/register', payload);
  },

  async getProfile() {
    const { data } = await api.get<{
      id: string;
      username: string;
      role: string;
    }>('/user/profile');

    return {
      id: data.id,
      username: data.username,
      role: data.role,
    };
  },
};
