import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  saveUsers: (users: StoredUser[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const login = (username: string, password: string): boolean => {
    const entry = state.users.find((user) => user.username === username && user.password === password);
    if (!entry) return false;
    const { password: _password, ...user } = entry;
    dispatch({ type: 'LOGIN', payload: user });
    return true;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });
  const saveUsers = (users: StoredUser[]) => dispatch({ type: 'SET_USERS', payload: users });

  const value = useMemo(() => ({ state, login, logout, saveUsers }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}