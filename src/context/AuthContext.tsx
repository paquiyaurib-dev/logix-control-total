import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { getUsuarios, replaceUsuarios } from '../lib/database';

export type UserRole = 'Administrador' | 'Supervisor' | 'Bodeguero' | 'Consulta';

export interface User {
  id: string;
  username: string;
  nombre: string;
  rol: UserRole;
  planta: string;
  avatar: string;
}

export interface StoredUser extends User {
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: StoredUser[];
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USERS'; payload: StoredUser[] }
  | { type: 'HYDRATE'; payload: AuthState };

const AUTH_STORAGE_KEY = 'logix-auth-state';
const USERS_STORAGE_KEY = 'logix-users';
const CHANNEL_NAME = 'logix-auth-sync';
const USERS_FALLBACK_URL = '/users.json';

const adminUser: StoredUser = {
  id: '1',
  username: 'admin',
  password: 'admin123',
  nombre: 'Administrador Principal',
  rol: 'Administrador',
  planta: 'Planta Principal',
  avatar: 'AP',
};

function normalizeUsers(users: StoredUser[]): StoredUser[] {
  const withoutAdmins = users.filter((user) => user.username !== 'admin');
  return [
    adminUser,
    ...withoutAdmins.map((user) => ({
      ...user,
      rol: user.rol === 'Administrador' ? 'Supervisor' : user.rol,
    })),
  ];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  users: [adminUser],
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_USERS': {
      const users = normalizeUsers(action.payload);
      const nextUser = state.user ? users.find((item) => item.id === state.user?.id) ?? null : null;
      return {
        ...state,
        users,
        user: nextUser,
        isAuthenticated: Boolean(nextUser),
      };
    }
    case 'HYDRATE':
      return { ...action.payload, users: normalizeUsers(action.payload.users) };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  saveUsers: (users: StoredUser[]) => Promise<void>;
  importUsersFromFile: (file: File) => Promise<{ ok: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [state, dispatch] = useReducer(authReducer, initialState, (baseState) => {
    if (typeof window === 'undefined') return baseState;
    try {
      const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const rawUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      const parsedAuth = rawAuth ? (JSON.parse(rawAuth) as Partial<AuthState>) : null;
      const parsedUsers = rawUsers ? normalizeUsers(JSON.parse(rawUsers) as StoredUser[]) : [adminUser];
      return {
        user: parsedAuth?.user ?? null,
        isAuthenticated: parsedAuth?.isAuthenticated ?? false,
        users: parsedUsers,
      };
    } catch {
      return baseState;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      users: state.users,
    };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(state.users));
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined' || remoteLoaded) return;

    const loadRemoteUsers = async () => {
      try {
        const users = normalizeUsers(await getUsuarios());
        if (users.length > 0) {
          dispatch({ type: 'SET_USERS', payload: users });
        }
      } catch {
        return;
      } finally {
        setRemoteLoaded(true);
      }
    };

    void loadRemoteUsers();
  }, [remoteLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined' || fallbackLoaded) return;
    const rawUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (rawUsers) {
      setFallbackLoaded(true);
      return;
    }

    const loadFallbackUsers = async () => {
      try {
        const response = await fetch(USERS_FALLBACK_URL, { cache: 'no-store' });
        if (!response.ok) {
          setFallbackLoaded(true);
          return;
        }
        const users = normalizeUsers((await response.json()) as StoredUser[]);
        dispatch({ type: 'SET_USERS', payload: users });
      } catch {
        return;
      } finally {
        setFallbackLoaded(true);
      }
    };

    void loadFallbackUsers();
  }, [fallbackLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = () => {
      try {
        const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
        const rawUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
        dispatch({
          type: 'HYDRATE',
          payload: {
            user: rawAuth ? (JSON.parse(rawAuth) as Partial<AuthState>).user ?? null : null,
            isAuthenticated: rawAuth ? (JSON.parse(rawAuth) as Partial<AuthState>).isAuthenticated ?? false : false,
            users: rawUsers ? (JSON.parse(rawUsers) as StoredUser[]) : [adminUser],
          },
        });
      } catch {
        return;
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY && event.key !== USERS_STORAGE_KEY) return;
      handleStorage();
    };

    window.addEventListener('storage', onStorage);

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => dispatch({ type: 'HYDRATE', payload: event.data as AuthState });
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      channel?.close();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    let users = state.users;
    try {
      const remoteUsers = normalizeUsers(await getUsuarios());
      if (remoteUsers.length > 0) {
        users = remoteUsers;
        dispatch({ type: 'SET_USERS', payload: remoteUsers });
      }
    } catch {
      users = state.users;
    }
    const entry = users.find((user) => user.username === username && user.password === password);
    if (!entry) return false;
    const { password: _password, ...user } = entry;
    dispatch({ type: 'LOGIN', payload: user });
    return true;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });
  const saveUsers = async (users: StoredUser[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
    try {
      await replaceUsuarios(normalizeUsers(users));
    } catch {
      return;
    }
  };
  const importUsersFromFile = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as StoredUser[];
      if (!Array.isArray(parsed)) {
        return { ok: false, message: 'El archivo no contiene una lista válida de usuarios.' };
      }
      const users = normalizeUsers(parsed);
      dispatch({ type: 'SET_USERS', payload: users });
      try {
        await replaceUsuarios(users);
      } catch {
        return { ok: true, message: `${users.length} usuarios importados localmente. No se pudo sincronizar con Supabase.` };
      }
      return { ok: true, message: `${users.length} usuarios importados correctamente.` };
    } catch {
      return { ok: false, message: 'No se pudo importar el archivo JSON de usuarios.' };
    }
  };

  const value = useMemo(() => ({ state, login, logout, saveUsers, importUsersFromFile }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}