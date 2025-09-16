import axios from 'axios';

const API_URL = '';

export interface DashboardStats {
  stats: {
    totalCustomers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
  };
  lastSyncedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
  address: any;
  tags: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalPrice: number;
  financialStatus: string;
  fulfillmentStatus: string;
  customer?: Customer;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  status: string;
  publishedAt: string;
  images: any[];
  variants: any[];
}

export interface PaginatedResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  [key: string]: any;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export interface OrdersByDate {
  date: string;
  count: number;
  totalRevenue: number;
}

const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get('/tenants/dashboard-stats');
  return response.data;
};

const syncData = async () => {
  const response = await axios.post('/tenants/sync');
  return response.data;
};

const getCustomers = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Customer[]>> => {
  const response = await axios.get('/customers', {
    params: { page, limit, search }
  });
  return response.data;
};

const getCustomerById = async (id: string) => {
  const response = await axios.get(`${API_URL}/customers/${id}`);
  return response.data;
};

const getTopCustomers = async (limit = 5) => {
  const response = await axios.get('/customers/top', {
    params: { limit }
  });
  return response.data;
};

const getCustomerStats = async () => {
  const response = await axios.get(`${API_URL}/customers/stats`);
  return response.data;
};

const getOrders = async (
  page = 1, 
  limit = 10, 
  search = '', 
  startDate?: string, 
  endDate?: string, 
  status?: string
): Promise<PaginatedResponse<Order[]>> => {
  const response = await axios.get(`${API_URL}/orders`, {
    params: { page, limit, search, startDate, endDate, status }
  });
  return response.data;
};

const getOrderById = async (id: string) => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
  return response.data;
};

const getOrdersByDateRange = async (params: DateRangeParams): Promise<{ ordersByDate: OrdersByDate[] }> => {
  const response = await axios.get('/orders/by-date', {
    params
  });
  return response.data;
};

const getOrderStats = async () => {
  const response = await axios.get(`${API_URL}/orders/stats`);
  return response.data;
};

const getProducts = async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Product[]>> => {
  const response = await axios.get(`${API_URL}/products`, {
    params: { page, limit, search }
  });
  return response.data;
};

const getProductById = async (id: string) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

const getProductStats = async () => {
  const response = await axios.get(`${API_URL}/products/stats`);
  return response.data;
};

const getEvents = async (
  page = 1, 
  limit = 10, 
  eventType?: string, 
  startDate?: string, 
  endDate?: string
) => {
  const response = await axios.get(`${API_URL}/events`, {
    params: { page, limit, eventType, startDate, endDate }
  });
  return response.data;
};

const getEventStats = async () => {
  const response = await axios.get(`${API_URL}/events/stats`);
  return response.data;
};

const dataService = {
  getDashboardStats,
  syncData,
  getCustomers,
  getCustomerById,
  getTopCustomers,
  getCustomerStats,
  getOrders,
  getOrderById,
  getOrdersByDateRange,
  getOrderStats,
  getProducts,
  getProductById,
  getProductStats,
  getEvents,
  getEventStats
};

export default dataService;
