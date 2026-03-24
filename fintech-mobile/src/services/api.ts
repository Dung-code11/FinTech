// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import {
  EXPO_API_URL_WEB,
  EXPO_API_URL_ANDROID,
  EXPO_API_URL_IOS,
  EXPO_API_URL_DEVICE,
} from '@env';

// 🎯 Xác định API URL đúng theo môi trường
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return EXPO_API_URL_WEB;
  }

  if (Platform.OS === 'android') {
    // 🔥 check máy thật chuẩn
    if (Device.isDevice) {
      return EXPO_API_URL_DEVICE;
    } else {
      return EXPO_API_URL_ANDROID;
    }
  }

  if (Platform.OS === 'ios') {
    return EXPO_API_URL_IOS;
  }

  return EXPO_API_URL_WEB;
};

// 🔗 Base URL
const API_BASE_URL = getApiUrl();

// 🧪 Debug log (rất quan trọng)
console.log('📱 Platform:', Platform.OS);
console.log('📱 Is Device:', Constants.isDevice);
console.log('🔗 API_URL:', API_BASE_URL);

// ⚡ Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🚀 Request interceptor (gắn token)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛑 Response interceptor (handle 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ API Error:', error?.response || error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('accessToken');
    }

    return Promise.reject(error);
  }
);

export default api;