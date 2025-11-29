import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Client connecté:", socket.id);

    socket.on("registerRole", (role) => {
      if (typeof role === "string") {
        socket.join(role);
        console.log(`Client ${socket.id} rejoint le rôle/room "${role}"`);
      }
    });
  });
}

export function getIO() {
  if (!io) throw new Error("Socket.io non initialisé");
  return io;
}
