import apiClient from '@/lib/axios';

export interface AdminDashboardStats {
  totalUsers: number;
  activeSenders: number;
  activeCarriers: number;
  activeBrokers: number;
  totalLoads: number;
  pendingLoads: number;
  inTransitLoads: number;
  completedLoads: number;
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newLoadsThisMonth: number;
}

export interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'SENDER' | 'CARRIER' | 'BROKER' | 'ADMIN';
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  totalLoads: number;
  totalOffers: number;
}

export interface LoadManagement {
  id: string;
  senderName: string;
  senderEmail: string;
  loadingCity: string;
  loadingAddress: string;
  deliveryCity: string;
  deliveryAddress: string;
  goodsType: string;
  weight: number;
  loadingDate: string;
  deliveryDate: string;
  status: 'PENDING' | 'ACTIVE' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
  insuranceRequested: boolean;
  isCompleted: boolean;
  offersCount: number;
  createdAt: string;
  carrierName: string | null;
  acceptedPrice: number | null;
}

export interface SystemHealth {
  status: string;
  databaseConnections: number;
  activeUsers: number;
  memoryUsage: number;
  uptime: string;
}

export interface DeliveryManagement {
  id: string;
  loadId: string;
  loadTitle: string;
  currentStatus: 'ON_THE_WAY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  currentLocation: string | null;
  lastUpdate: string;
  statusNote: string | null;
  pickupDocuments: string[];
  deliveryDocuments: string[];
  cancellationDocuments: string[];
  senderInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  carrierInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicleInfo: {
    plateNumber: string;
    type: string;
  } | null;
  pickupTime: string | null;
  deliveryTime: string | null;
  loadDetails: {
    goodsType: string;
    weight: number;
    loadingCity: string;
    deliveryCity: string;
    loadingAddress: string;
    deliveryAddress: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminService = {
  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data.data;
  },

  // User Management
  async getAllUsers(page = 0, size = 10): Promise<PageResponse<UserManagement>> {
    const response = await apiClient.get('/admin/users', {
      params: { page, size }
    });
    return response.data.data;
  },

  async getUsersByRole(
    role: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<UserManagement>> {
    const response = await apiClient.get(`/admin/users/role/${role}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  async searchUsers(
    search?: string,
    role?: string,
    active?: boolean,
    page = 0,
    size = 10
  ): Promise<PageResponse<UserManagement>> {
    const response = await apiClient.get('/admin/users/search', {
      params: { search, role, active, page, size }
    });
    return response.data.data;
  },

  async toggleUserActive(userId: string): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/toggle-active`);
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/role`, newRole, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Load Management
  async getAllLoads(page = 0, size = 10): Promise<PageResponse<LoadManagement>> {
    const response = await apiClient.get('/admin/loads', {
      params: { page, size }
    });
    return response.data.data;
  },

  async getLoadsByStatus(
    status: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<LoadManagement>> {
    const response = await apiClient.get(`/admin/loads/status/${status}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  async searchLoads(
    search?: string,
    status?: string,
    completed?: boolean,
    page = 0,
    size = 10
  ): Promise<PageResponse<LoadManagement>> {
    const response = await apiClient.get('/admin/loads/search', {
      params: { search, status, completed, page, size }
    });
    return response.data.data;
  },

  async updateLoadStatus(loadId: string, newStatus: string): Promise<void> {
    await apiClient.put(`/admin/loads/${loadId}/status`, newStatus, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async deleteLoad(loadId: string): Promise<void> {
    await apiClient.delete(`/admin/loads/${loadId}`);
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get('/admin/health');
    return response.data.data;
  },

  // Delivery Management
  async getActiveDeliveries(page = 0, size = 10): Promise<PageResponse<DeliveryManagement>> {
    const response = await apiClient.get('/admin/deliveries/active', {
      params: { page, size }
    });
    return response.data.data;
  },

  async getCompletedDeliveries(page = 0, size = 10): Promise<PageResponse<DeliveryManagement>> {
    const response = await apiClient.get('/admin/deliveries/completed', {
      params: { page, size }
    });
    return response.data.data;
  },

  async getDeliveryById(deliveryId: string): Promise<DeliveryManagement> {
    const response = await apiClient.get(`/admin/deliveries/${deliveryId}`);
    return response.data.data;
  },

  async searchDeliveries(
    search?: string,
    status?: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<DeliveryManagement>> {
    const response = await apiClient.get('/admin/deliveries/search', {
      params: { search, status, page, size }
    });
    return response.data.data;
  }
};

export default adminService;
