const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async register(userData: { role: string; name: string; phone: string; pin?: string }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { phone: string; pin?: string }) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request('/users/me');
  }

  async getProducts(shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    return this.request(`/products${params}`);
  }

  async createProduct(data: { name: string; price: number; imageUrl: string; coffeeShopId: string; additionalItems?: string[] }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createOrder(orderData: {
    userId?: string;
    items: Array<{ productId: string; quantity: number }>;
    totalPrice: number;
    customerName?: string;
    customerPhone?: string;
    coffeeShopId: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async getUserOrders(userId: string) {
    return this.request(`/orders/user/${userId}`);
  }

  async updateOrderStatus(orderId: string, data: { status: string; estimatedTime?: number }) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async startShift(employeeId: string) {
    return this.request('/shifts/start', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  }

  async endShift(employeeId: string) {
    return this.request('/shifts/end', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  }

  async getEmployeeShifts(employeeId: string) {
    return this.request(`/shifts/${employeeId}`);
  }

  async getTasks(shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    return this.request(`/tasks${params}`);
  }

  async createTask(taskData: { description: string; employeeId?: string; coffeeShopId: string }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updates: { status?: string; employeeId?: string }) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getMessages() {
    return this.request('/messages');
  }

  async createMessage(messageData: { title: string; body: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getAdditionalItems(shopId?: string) {
    const params = shopId ? `?shopId=${shopId}` : '';
    return this.request(`/additional-items${params}`);
  }

  async createAdditionalItem(data: { name: string; price: number; productId?: string; coffeeShopId: string }) {
    return this.request('/additional-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdditionalItem(id: string, data: { name: string; price: number; productId?: string }) {
    return this.request(`/additional-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdditionalItem(id: string) {
    return this.request(`/additional-items/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProduct(id: string, data: { name: string; price: number; imageUrl: string; additionalItems?: string[] }) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async createUser(data: { role: string; name: string; phone: string; pin?: string }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async getScheduledShifts(employeeId?: string) {
    const url = employeeId ? `/scheduled-shifts?employeeId=${employeeId}` : '/scheduled-shifts';
    return this.request(url);
  }

  async createScheduledShift(data: { employeeId: string; weekdays: number[]; startTime: string; endTime: string }) {
    return this.request('/scheduled-shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScheduledShift(id: string, data: { employeeId: string; weekdays: number[]; startTime: string; endTime: string; isActive: boolean }) {
    return this.request(`/scheduled-shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteScheduledShift(id: string) {
    return this.request(`/scheduled-shifts/${id}`, {
      method: 'DELETE',
    });
  }

  async getPromotions() {
    return this.request('/promotions');
  }

  async createPromotion(data: { type: string; title: string; description: string; imageUrl?: string; validFrom: string; validTo?: string; createdBy: string }) {
    return this.request('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePromotion(id: string, data: { type: string; title: string; description: string; imageUrl?: string; isActive: boolean; validFrom: string; validTo?: string }) {
    return this.request(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromotion(id: string) {
    return this.request(`/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  async getStatistics() {
    return this.request('/statistics');
  }

  async updateStatistics(data: { employeeId: string; action: string; value?: number }) {
    return this.request('/statistics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentShifts() {
    return this.request('/current-shifts');
  }

  async getActivePromotions() {
    return this.request('/promotions/active');
  }

  async getCurrentShift(employeeId: string) {
    return this.request(`/shifts/current?employeeId=${employeeId}`);
  }

  async getUnreadCounts(employeeId: string, shopId?: string) {
    const params = new URLSearchParams({ employeeId });
    if (shopId) params.append('shopId', shopId);
    return this.request(`/unread-counts?${params.toString()}`);
  }

  async markMessagesAsRead(userId: string, shopId?: string) {
    const params = new URLSearchParams({ userId });
    if (shopId) params.append('shopId', shopId);
    return this.request(`/chat/mark-read?${params.toString()}`, {
      method: 'POST',
    });
  }

  async getCoffeeShops() {
    return this.request('/coffee-shops');
  }

  async getCoffeeShop(shopId: string) {
    return this.request(`/coffee-shops/${shopId}`);
  }

  async createCoffeeShop(data: { name: string; location: string; address: string; adminId: string }) {
    return this.request('/coffee-shops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoffeeShop(id: string, data: { name: string; location: string; address: string; isActive: boolean }) {
    return this.request(`/coffee-shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoffeeShop(id: string) {
    return this.request(`/coffee-shops/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
