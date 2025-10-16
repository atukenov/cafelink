import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";

interface ExtendedGlobal {
  io?: Server;
}

declare const global: ExtendedGlobal;

type SocketEvent =
  | "order-status-update"
  | "new-order"
  | "new-message"
  | "user-typing"
  | "mark-messages-read"
  | "task-update";

interface SocketData {
  orderId?: string;
  status?: string;
  estimatedTime?: number;
  message?: string;
  userId?: string;
  userName?: string;
  taskId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { event, data }: { event: SocketEvent; data: SocketData } =
      await request.json();

    if (global.io) {
      switch (event) {
        case "order-status-update":
          if (data.orderId) {
            global.io.to(`order-${data.orderId}`).emit("order-updated", data);
            global.io.to("employees").emit("order-updated", data);
          }
          break;
        case "new-order":
          global.io.to("employees").emit("new-order", data);
          break;
        case "new-message":
          global.io.to("employees").emit("new-message", data);
          break;
        case "user-typing":
          global.io.to("employees").emit("user-typing", data);
          break;
        case "mark-messages-read":
          global.io.to("employees").emit("messages-read", data);
          break;
        case "task-update":
          global.io.to("employees").emit("task-update", data);
          break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Socket API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
