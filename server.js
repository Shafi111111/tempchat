const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", (ws) => {
  let currentRoom = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "join") {
      currentRoom = data.room;
      if (!rooms.has(currentRoom)) {
        rooms.set(currentRoom, []);
      }
      rooms.get(currentRoom).push(ws);
    } else if (data.type === "message" && currentRoom) {
      const clients = rooms.get(currentRoom) || [];
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", text: data.text }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      const clients = rooms.get(currentRoom) || [];
      const newClients = clients.filter((client) => client !== ws);
      if (newClients.length === 0) {
        rooms.delete(currentRoom);
      } else {
        rooms.set(currentRoom, newClients);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});