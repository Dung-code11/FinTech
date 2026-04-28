import { isAxiosError } from 'axios';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authService } from '@/services/auth-service';
import type { LoginCredentials, SessionUser } from '@/types/auth';
import { storage } from '@/utils/storage';

interface SessionContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  token: string | null;
  user: SessionUser | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  markOnboardingSeen: (value: boolean) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function isUnauthorized(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const [onboardingSeen, persistedSession] = await Promise.all([
        storage.getOnboardingSeen(),
        storage.getSession(),
      ]);

      setHasSeenOnboarding(onboardingSeen);

      if (!persistedSession) {
        return;
      }

      setToken(persistedSession.token);
      setUser(persistedSession.user);

      try {
        const profile = await authService.getProfile();
        const nextUser: SessionUser = {
          ...persistedSession.user,
          id: profile.id,
          username: profile.username,
          role: profile.role,
        };

        setUser(nextUser);
        await storage.setSession({
          token: persistedSession.token,
          user: nextUser,
        });
      } catch (error) {
        if (isUnauthorized(error)) {
          await storage.clearSession();
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setIsReady(true);
    }
  }

  async function signIn(credentials: LoginCredentials) {
    const session = await authService.login(credentials);
    setToken(session.token);
    setUser(session.user);
    await storage.setSession(session);
  }

  async function signOut() {
    await storage.clearSession();
    setToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    if (!token || !user) {
      return;
    }

    const profile = await authService.getProfile();
    const nextUser: SessionUser = {
      ...user,
      id: profile.id,
      username: profile.username,
      role: profile.role,
    };

    setUser(nextUser);
    await storage.setSession({ token, user: nextUser });
  }

  async function markOnboardingSeen(value: boolean) {
    setHasSeenOnboarding(value);
    await storage.setOnboardingSeen(value);
  }

  return (
    <SessionContext.Provider
      value={{
        isReady,
        isAuthenticated: Boolean(token && user),
        hasSeenOnboarding,
        token,
        user,
        signIn,
        signOut,
        refreshProfile,
        markOnboardingSeen,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
}
