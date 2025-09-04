import { io, Socket } from 'socket.io-client';

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
      this.socket.emit('join-employee');
    }
  }

  joinClient(orderId: string) {
    if (this.socket) {
      this.socket.emit('join-client', orderId);
    }
  }

  emitOrderStatusUpdate(orderId: string, status: string, estimatedTime?: number) {
    if (this.socket) {
      this.socket.emit('order-status-update', { orderId, status, estimatedTime });
    }
  }

  emitNewOrder(orderData: any) {
    if (this.socket) {
      this.socket.emit('new-order', orderData);
    }
  }

  onOrderUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order-updated', callback);
    }
  }

  onNewOrder(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-order', callback);
    }
  }

  offOrderUpdated() {
    if (this.socket) {
      this.socket.off('order-updated');
    }
  }

  offNewOrder() {
    if (this.socket) {
      this.socket.off('new-order');
    }
  }
}

export const socketManager = new SocketManager();
