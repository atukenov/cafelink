import { io, Socket } from "socket.io-client";
import { IOrder } from "../models/Order";

interface IUserTyping {
  userId: string;
  userName: string;
}

interface IMessagesRead {
  userId: string;
  readAt: Date;
}

interface IChatMessage {
  message: string;
  userId: string;
  userName: string;
  userRole: "client" | "employee" | "administrator" | "admin" | "author";
  createdAt: Date;
  readBy: { userId: string; readAt: Date }[];
}

export interface ISocketTaskUpdate {
  type: "created" | "completed";
  _id?: string;
  description: string;
  status: "pending" | "done";
  employeeId?: string;
  createdBy?: string;
  coffeeShopId: string;
  isGlobal: boolean;
  createdAt?: Date;
  employeeName?: string;
}

class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinEmployee() {
    if (this.socket) {
      this.socket.emit("join-employee");
    }
  }

  joinClient(orderId: string) {
    if (this.socket) {
      this.socket.emit("join-client", orderId);
    }
  }

  emitOrderStatusUpdate(
    orderId: string,
    status: string,
    estimatedTime?: number
  ) {
    if (this.socket) {
      this.socket.emit("order-status-update", {
        orderId,
        status,
        estimatedTime,
      });
    }
  }

  emitNewOrder(orderData: Omit<IOrder, "_id" | "createdAt" | "updatedAt">) {
    if (this.socket) {
      this.socket.emit("new-order", orderData);
    }
  }

  onOrderUpdated(callback: (data: IOrder) => void) {
    if (this.socket) {
      this.socket.on("order-updated", callback);
    }
  }

  onNewOrder(callback: (data: IOrder) => void) {
    if (this.socket) {
      this.socket.on("new-order", callback);
    }
  }

  offOrderUpdated() {
    if (this.socket) {
      this.socket.off("order-updated");
    }
  }

  offNewOrder() {
    if (this.socket) {
      this.socket.off("new-order");
    }
  }

  emitNewMessage(messageData: Omit<IChatMessage, "createdAt" | "readBy">) {
    if (this.socket) {
      this.socket.emit("new-message", messageData);
    }
  }

  onNewMessage(callback: (data: IChatMessage) => void) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off("new-message");
    }
  }

  emitTaskUpdate(taskData: Omit<ISocketTaskUpdate, "_id" | "createdAt">) {
    if (this.socket) {
      this.socket.emit("task-update", taskData);
    }
  }

  onTaskUpdate(callback: (data: ISocketTaskUpdate) => void) {
    if (this.socket) {
      this.socket.on("task-update", callback);
    }
  }

  offTaskUpdate() {
    if (this.socket) {
      this.socket.off("task-update");
    }
  }

  emitUserTyping(userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit("user-typing", { userId, userName });
    }
  }

  onUserTyping(callback: (data: IUserTyping) => void) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off("user-typing");
    }
  }

  emitMarkMessagesRead(userId: string) {
    if (this.socket) {
      this.socket.emit("mark-messages-read", { userId });
    }
  }

  onMessagesRead(callback: (data: IMessagesRead) => void) {
    if (this.socket) {
      this.socket.on("messages-read", callback);
    }
  }

  offMessagesRead() {
    if (this.socket) {
      this.socket.off("messages-read");
    }
  }
}

export const socketManager = new SocketManager();
