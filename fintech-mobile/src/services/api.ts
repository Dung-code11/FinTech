import axios from 'axios';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import {
  EXPO_API_URL_ANDROID,
  EXPO_API_URL_DEVICE,
  EXPO_API_URL_IOS,
  EXPO_API_URL_WEB,
} from '@env';

import { storage } from '@/utils/storage';

function resolveApiUrl() {
  if (Platform.OS === 'web') {
    return EXPO_API_URL_WEB;
  }

  if (Platform.OS === 'android') {
    return Device.isDevice ? EXPO_API_URL_DEVICE : EXPO_API_URL_ANDROID;
  }

  if (Platform.OS === 'ios') {
    return EXPO_API_URL_IOS;
  }

  return EXPO_API_URL_WEB;
}

export function getApiBaseUrl() {
  return resolveApiUrl().replace(/\/$/, '');
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearSession();
    }

    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (typeof error.response?.data === 'string' && error.response.data) ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Không thể kết nối tới máy chủ'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}

export default api;
