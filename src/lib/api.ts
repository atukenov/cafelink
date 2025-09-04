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

  async getProducts() {
    return this.request('/products');
  }

  async createProduct(productData: { name: string; price: number; imageUrl: string }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async createOrder(orderData: {
    userId?: string;
    items: Array<{ productId: string; quantity: number }>;
    totalPrice: number;
    customerName?: string;
    customerPhone?: string;
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

  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData: { description: string; employeeId?: string }) {
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
}

export const apiClient = new ApiClient();
