let ws;
let currentRoom = "";

function generateCode() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 30; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function joinRoom() {
  const room = document.getElementById("room-input").value || generateCode();
  document.getElementById("room-display").textContent = "Room: " + room;
  document.getElementById("chat").style.display = "block";

  ws = new WebSocket("wss://" + location.host);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", room }));
  };
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "message") {
      const msgDiv = document.createElement("div");
      msgDiv.textContent = data.text;
      document.getElementById("messages").appendChild(msgDiv);
    }
  };

  currentRoom = room;
}

function sendMessage() {
  const msg = document.getElementById("msg").value;
  if (ws && msg) {
    ws.send(JSON.stringify({ type: "message", text: msg }));
    const msgDiv = document.createElement("div");
    msgDiv.textContent = "(you): " + msg;
    document.getElementById("messages").appendChild(msgDiv);
    document.getElementById("msg").value = "";
  }
}