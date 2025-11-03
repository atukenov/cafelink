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
  userId: string;
  coffeeShopId: string;
  items: OrderItem[];
  status: "received" | "viewed" | "accepted" | "rejected" | "ready";
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

export type OrderStatus = Order["status"];

// MongoDB document structure
interface IMongoOrder extends Omit<Order, '_id' | 'createdAt' | 'updatedAt'> {
  _id: { toString(): string };
  createdAt: { toISOString(): string };
  updatedAt: { toISOString(): string };
}

// Convert Mongoose IOrder to frontend Order
export const toFrontendOrder = (order: IMongoOrder): Order => ({
  ...order,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
  _id: order._id.toString(),
});
