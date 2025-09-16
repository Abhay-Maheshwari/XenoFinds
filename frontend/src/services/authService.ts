import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ShopifyCredentials {
  shopifyApiKey: string;
  shopifyApiSecret: string;
  shopifyStoreUrl: string;
}

export interface AuthResponse {
  message: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  exp: number;
}

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/auth/register', data);
  setAuthToken(response.data.token);
  return response.data;
};

const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/auth/login', credentials);
  setAuthToken(response.data.token);
  return response.data;
};

const logout = (): void => {
  setAuthToken(null);
};

const getProfile = async () => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

const updateShopifyCredentials = async (credentials: ShopifyCredentials) => {
  const response = await axios.put('/auth/shopify-credentials', credentials);
  return response.data;
};

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  return !isTokenExpired(token);
};

const initializeAuth = (): void => {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    setAuthToken(token);
  } else {
    setAuthToken(null);
  }
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateShopifyCredentials,
  isAuthenticated,
  initializeAuth
};

export default authService;
