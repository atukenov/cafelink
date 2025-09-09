'use client';

import { useEffect, useRef } from 'react';
import { socketManager } from '@/lib/socket';
import { useShop } from '@/contexts/ShopContext';

interface UseSocketOptions {
  onOrderUpdate?: (data: any) => void;
  onNewOrder?: (data: any) => void;
  onTaskUpdate?: (data: any) => void;
  onNewMessage?: (data: any) => void;
  onUserTyping?: (data: any) => void;
  onMessagesRead?: (data: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { selectedShop } = useShop();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!selectedShop) return;

    const socket = socketManager.connect();
    
    socket.emit('join-shop', selectedShop._id);

    if (optionsRef.current.onOrderUpdate) {
      socketManager.onOrderUpdated(optionsRef.current.onOrderUpdate);
    }
    
    if (optionsRef.current.onNewOrder) {
      socketManager.onNewOrder(optionsRef.current.onNewOrder);
    }
    
    if (optionsRef.current.onTaskUpdate) {
      socketManager.onTaskUpdate(optionsRef.current.onTaskUpdate);
    }
    
    if (optionsRef.current.onNewMessage) {
      socketManager.onNewMessage(optionsRef.current.onNewMessage);
    }
    
    if (optionsRef.current.onUserTyping) {
      socketManager.onUserTyping(optionsRef.current.onUserTyping);
    }
    
    if (optionsRef.current.onMessagesRead) {
      socketManager.onMessagesRead(optionsRef.current.onMessagesRead);
    }

    return () => {
      socket.emit('leave-shop', selectedShop._id);
      socketManager.offOrderUpdated();
      socketManager.offNewOrder();
      socketManager.offTaskUpdate();
      socketManager.offNewMessage();
      socketManager.offUserTyping();
      socketManager.offMessagesRead();
    };
  }, [selectedShop]);

  return {
    emitOrderStatusUpdate: socketManager.emitOrderStatusUpdate,
    emitNewOrder: socketManager.emitNewOrder,
    emitTaskUpdate: socketManager.emitTaskUpdate,
    emitNewMessage: socketManager.emitNewMessage,
    emitUserTyping: socketManager.emitUserTyping,
  };
};
