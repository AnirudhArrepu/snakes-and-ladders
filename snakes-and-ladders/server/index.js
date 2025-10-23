const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const { Server } = require("socket.io");
const path = require("path");

// app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
});

app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});


let rooms = {};
let toPlayIndex = 0;

let snakes = {};
let ladders = {};

// Custom CSV reader for your 3-column format
const readline = require("readline");

function loadCustomCSV(filePath, mapObject, label) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const parts = line.split(",").map(Number);
      if (parts.length >= 2) {
        const start = parts[0];
        const end = parts[parts.length - 1];
        if (!isNaN(start) && !isNaN(end)) {
          mapObject[start] = end;
        }
      }
    });

    rl.on("close", () => {
      console.log(`${label} loaded:`, mapObject);
      resolve();
    });

    rl.on("error", reject);
  });
}


async function initializeGameData() {
  await Promise.all([
    loadCustomCSV("./snakes.csv", snakes, "Snakes"),
    loadCustomCSV("./ladders.csv", ladders, "Ladders"),
  ]);
}

initializeGameData().then(() => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", ({ room, player }) => {
      if (!rooms[room]) {
        rooms[room] = [];
      }

      player = { ...player, socketId: socket.id, index: rooms[room].length };
      socket.join(room);
      rooms[room].push(player);

      io.to(room).emit("players_update", rooms[room]);
    });

    socket.on("roll_dice", (data) => {
      const { room, rolledNum } = data;
      if (!rooms[room]) return;

      const toPlayPlayer = rooms[room][toPlayIndex];
      if (toPlayPlayer.socketId !== socket.id) return;

      let newPos = toPlayPlayer.position + rolledNum;

      if (snakes[newPos]) newPos = snakes[newPos];
      if (ladders[newPos]) newPos = ladders[newPos];

      if (newPos > 132) return;

      if (newPos === 132) {
        toPlayPlayer.position = newPos;
        toPlayIndex = (toPlayIndex + 1) % rooms[room].length;
        io.to(room).emit("new_change_idx", newPos);
        io.to(room).emit("players_update", rooms[room]);
        io.to(room).emit("update_turn_index", toPlayIndex);
        io.to(room).emit("game_winner", toPlayPlayer.name);
        return;
      }

      toPlayPlayer.position = newPos;
      toPlayIndex = (toPlayIndex + 1) % rooms[room].length;

      io.to(room).emit("new_change_idx", newPos);
      io.to(room).emit("players_update", rooms[room]);
      io.to(room).emit("update_turn_index", toPlayIndex);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const room in rooms) {
        const playerIndex = rooms[room].findIndex(
          (p) => p.socketId === socket.id
        );
        if (playerIndex !== -1) {
          rooms[room].splice(playerIndex, 1);
          if (rooms[room].length === 0) delete rooms[room];
          else io.to(room).emit("players_update", rooms[room]);
          break;
        }
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
