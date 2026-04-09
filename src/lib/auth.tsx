'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import api from './api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  reputation: number;
  streak: number;
  is_pro: boolean;
  role?: 'admin' | 'instructor' | 'student';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginDemo: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    // GitHub OAuth session — exchange for backend JWT
    if (session?.user) {
      const email = session.user.email || '';
      const name = session.user.name || '';
      const avatar = session.user.image || '';

      // Check if we already have a valid backend token
      const existingToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (existingToken && existingToken !== 'mock_admin_token') {
        // We have a real token, try to get user from backend
        api.getMe()
          .then((me) => {
            setUser({ ...me, reputation: me.reputation || 0, streak: me.streak || 0, is_pro: me.is_pro_member || false });
            setLoading(false);
          })
          .catch(() => {
            // Token expired, re-exchange
            exchangeGitHubToken(email, name, avatar);
          });
        return;
      }

      // Exchange GitHub profile for backend JWT
      exchangeGitHubToken(email, name, avatar);
      return;
    }

    // Check for existing backend token (email/password login)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && token !== 'mock_admin_token') {
      api.getMe()
        .then((me) => {
          setUser({ ...me, reputation: me.reputation || 0, streak: me.streak || 0, is_pro: me.is_pro_member || false });
        })
        .catch(() => {
          api.clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
      return;
    }

    // Check for saved user from previous login
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    setUser(null);
    setLoading(false);
  }, [session, status]);

  const exchangeGitHubToken = async (email: string, name: string, avatar: string) => {
    try {
      const res = await api.githubAuth({ email, name, avatar });
      const u = res.user;
      const mapped: User = {
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: u.avatar || avatar,
        bio: u.bio || '',
        reputation: u.reputation || 0,
        streak: u.streak || 0,
        is_pro: u.is_pro_member || false,
        role: u.is_superuser ? 'admin' : u.is_staff ? 'instructor' : 'student',
      };
      localStorage.setItem('user', JSON.stringify(mapped));
      setUser(mapped);
      setIsDemoMode(false);
    } catch {
      // Backend unreachable — set basic user from GitHub session (limited functionality)
      setUser({
        id: 0,
        username: name || 'GitHub User',
        email: email,
        avatar: avatar,
        bio: '',
        reputation: 0,
        streak: 0,
        is_pro: false,
      });
    }
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    // Try backend API
    try {
      await api.login({ username, password });
      const me = await api.getMe();
      const mapped: User = {
        id: me.id,
        username: me.username,
        email: me.email,
        avatar: me.avatar || '',
        bio: me.bio || '',
        reputation: me.reputation || 0,
        streak: me.streak || 0,
        is_pro: me.is_pro_member || false,
        role: me.is_superuser ? 'admin' : me.is_staff ? 'instructor' : 'student',
      };
      localStorage.setItem('user', JSON.stringify(mapped));
      setUser(mapped);
      setIsDemoMode(false);
      return;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  const loginDemo = useCallback(() => {
    // Demo mode removed for production — redirect to login
    window.location.href = '/login';
  }, []);

  const register = async (username: string, email: string, password: string) => {
    const res = await api.register({ username, email, password });
    if (res.access) api.setToken(res.access);
    const me = await api.getMe();
    const mapped: User = {
      id: me.id,
      username: me.username,
      email: me.email,
      avatar: me.avatar || '',
      bio: me.bio || '',
      reputation: me.reputation || 0,
      streak: me.streak || 0,
      is_pro: me.is_pro_member || false,
      role: 'student',
    };
    localStorage.setItem('user', JSON.stringify(mapped));
    setUser(mapped);
    setIsDemoMode(false);
  };

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsDemoMode(false);
    if (session) {
      nextAuthSignOut({ callbackUrl: '/' });
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, register, logout, isAuthenticated: !!user, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
