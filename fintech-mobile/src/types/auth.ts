export type UserRole = 'ADMIN' | 'USER' | string;

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
  email?: string | null;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
  username: string;
  role: UserRole;
}

export type Sex = 'NAM' | 'NU';

export interface RegisterPayload {
  username: string;
  password: string;
  fullname: string;
  birthday: string;
  sex: Sex;
  address: string;
  email: string;
  phone: string;
}

export interface StoredSession {
  token: string;
  user: SessionUser;
}

export interface AppPreferences {
  notificationsEnabled: boolean;
  hideSensitiveBalances: boolean;
  biometricEnabled: boolean;
  compactNumbers: boolean;
}
