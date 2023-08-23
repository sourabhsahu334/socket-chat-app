const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store room participants
const roomParticipants = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (targetSocketID) => {
    const roomID = targetSocketID; // Use the target socket ID as the room ID
    socket.join(roomID);

    if (!roomParticipants[roomID]) {
      roomParticipants[roomID] = [];
    }
    roomParticipants[roomID].push(socket.id);

    console.log(`User with ID: ${socket.id} joined room: ${roomID}`);
  });

  socket.on("send_message", (data) => {
    const { targetSocketID, message,name } = data;
    const senderSocketID = socket.id;
    const roomID = targetSocketID;

    io.to(roomID).emit("receive_message", {
      senderSocketID,
      message,
      name
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    
    // Remove the disconnected socket ID from all rooms
    for (const roomID in roomParticipants) {
      roomParticipants[roomID] = roomParticipants[roomID].filter(id => id !== socket.id);
    }
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
