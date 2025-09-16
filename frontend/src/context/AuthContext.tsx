import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import authService from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateShopifyCredentials: (credentials: {
    shopifyApiKey: string;
    shopifyApiSecret: string;
    shopifyStoreUrl: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const mockUsers = [
    {
      id: 'demo-user-1',
      name: 'Demo Store 1',
      email: 'demo1@example.com',
      shopifyStoreUrl: 'demo1.myshopify.com'
    },
    {
      id: 'demo-user-2', 
      name: 'Fashion Boutique',
      email: 'fashion@example.com',
      shopifyStoreUrl: 'fashion-boutique.myshopify.com'
    },
    {
      id: 'demo-user-3',
      name: 'Tech Gadgets Store',
      email: 'tech@example.com',
      shopifyStoreUrl: 'tech-gadgets.myshopify.com'
    }
  ];

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(mockUsers[0]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(true);
    setUser(mockUsers[0]);
    setLoading(false);
    
    // Set a mock auth token for API calls
    localStorage.setItem('token', 'demo-jwt-token-for-testing');
    
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = mockUsers.find(u => u.email === email) || mockUsers[0];
    setUser(foundUser);
    setIsAuthenticated(true);
  };

  const register = async (name: string, email: string, password: string) => {
    setUser(mockUsers[0]);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(mockUsers[0]);
    setIsAuthenticated(true);
  };

  const updateShopifyCredentials = async (credentials: {
    shopifyApiKey: string;
    shopifyApiSecret: string;
    shopifyStoreUrl: string;
  }) => {
    try {
      const response = await authService.updateShopifyCredentials(credentials);
      setUser(response.tenant);
    } catch (error) {
      console.error('Update Shopify credentials error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        updateShopifyCredentials
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
