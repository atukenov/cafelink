export interface User {
  _id: string;
  role: 'client' | 'employee' | 'admin' | 'administrator' | 'author';
  name: string;
  phone: string;
  createdAt: string;
}

export interface AdditionalItem {
  _id: string;
  name: string;
  price: number;
  productId?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  additionalItems?: AdditionalItem[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  additionalItems?: {
    additionalItemId: string;
    quantity: number;
  }[];
}

export interface Order {
  _id: string;
  userId?: string;
  items: OrderItem[];
  status: 'received' | 'viewed' | 'accepted' | 'rejected' | 'ready';
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  estimatedTime?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  _id: string;
  employeeId: string;
  startTime: string;
  endTime?: string;
}

export interface Task {
  _id: string;
  description: string;
  status: 'pending' | 'done';
  employeeId?: string;
  createdBy?: string;
  isGlobal: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedAdditionalItems?: {
    additionalItemId: string;
    quantity: number;
    name: string;
    price: number;
  }[];
}

export interface ScheduledShift {
  _id: string;
  employeeId: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface Promotion {
  _id: string;
  type: 'sale' | 'news';
  title: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  createdBy: string;
  createdAt: string;
}

export interface EmployeeStats {
  _id: string;
  employeeId: string;
  tasksCompleted: number;
  tasksAssigned: number;
  shiftsAttended: number;
  shiftsScheduled: number;
  ordersProcessed: number;
  averageOrderTime: number;
  rating: number;
  lastUpdated: string;
}
