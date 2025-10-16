export interface User {
  _id: string;
  role: 'client' | 'employee' | 'admin' | 'administrator' | 'author';
  name: string;
  phone: string;
  coffeeShopId?: string;
  createdAt: string;
}

export interface CoffeeShop {
  _id: string;
  name: string;
  location: string;
  address: string;
  adminId: string;
  isActive: boolean;
  settings: {
    timezone: string;
    currency: string;
    theme: string;
  };
  createdAt: string;
}

export interface AdditionalItem {
  _id: string;
  name: string;
  price: number;
  productId?: string;
  coffeeShopId: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  coffeeShopId: string;
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
  coffeeShopId: string;
  items: OrderItem[];
  status: 'received' | 'viewed' | 'accepted' | 'rejected' | 'ready';
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  estimatedTime?: number;
  rejectionReason?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  _id: string;
  employeeId: string;
  coffeeShopId: string;
  startTime: string;
  endTime?: string;
}

export interface Task {
  _id: string;
  description: string;
  status: 'pending' | 'done';
  employeeId?: string;
  createdBy?: string;
  coffeeShopId: string;
  isGlobal: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  title: string;
  body: string;
  coffeeShopId: string;
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
  coffeeShopId: string;
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
  coffeeShopId: string;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  createdBy: string;
  createdAt: string;
}

export interface EmployeeStats {
  _id: string;
  employeeId: string;
  coffeeShopId: string;
  tasksCompleted: number;
  tasksAssigned: number;
  shiftsAttended: number;
  shiftsScheduled: number;
  ordersProcessed: number;
  averageOrderTime: number;
  rating: number;
  lastUpdated: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  userName: string;
  message: string;
  coffeeShopId: string;
  readBy: {
    userId: string;
    readAt: Date;
  }[];
  createdAt: string;
}

export interface LoyaltyProgram {
  _id: string;
  shopId: string;
  name?: string;
  earningRate: number;
  pointExpiryDays?: number;
  tiers: Array<{
    key: string;
    name: string;
    minPoints: number;
    multiplier?: number;
  }>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserLoyalty {
  _id: string;
  userId: string;
  shopId: string;
  pointsBalance: number;
  pointsPending?: number;
  tierKey?: string;
  lastUpdated: string;
}

export interface LoyaltyTransaction {
  _id: string;
  userId: string;
  shopId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  orderId?: string;
  rewardId?: string;
  source?: string;
  meta?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface Reward {
  _id: string;
  shopId: string;
  title: string;
  description?: string;
  pointsCost: number;
  type: 'discount' | 'free_item' | 'coupon';
  value?: number;
  metadata?: Record<string, string | number | boolean>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Redemption {
  _id: string;
  userId: string;
  shopId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'reserved' | 'fulfilled' | 'cancelled';
  code?: string;
  createdAt: string;
  fulfilledAt?: string;
  cancelledAt?: string;
}
