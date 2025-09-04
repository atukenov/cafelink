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
}
