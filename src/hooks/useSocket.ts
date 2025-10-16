"use client";

import { useShop } from "@/contexts/ShopContext";
import { ISocketTaskUpdate, socketManager } from "@/lib/socket";
import { IOrder } from "@/models/Order";
import { useEffect, useRef } from "react";

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

interface UseSocketOptions {
  onOrderUpdate?: (data: IOrder) => void;
  onNewOrder?: (data: IOrder) => void;
  onTaskUpdate?: (data: ISocketTaskUpdate) => void;
  onNewMessage?: (data: IChatMessage) => void;
  onUserTyping?: (data: IUserTyping) => void;
  onMessagesRead?: (data: IMessagesRead) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { selectedShop } = useShop();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!selectedShop) return;

    const socket = socketManager.connect();

    socket.emit("join-shop", selectedShop._id);

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
      socket.emit("leave-shop", selectedShop._id);
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
