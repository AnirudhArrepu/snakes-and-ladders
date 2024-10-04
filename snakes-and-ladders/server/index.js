const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: { 
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"]
    },
});

let rooms = {};
let toPlayIndex = 0;

// const ladders = {
//     4:56,
//     12:50,
//     14:55,
//     22:58,
//     41:79,
//     54:88
// };

// const snakes = {
//     28:10,
//     37:3,
//     48:16,
//     75:32,
//     96:42,
//     94:71
// };

const ladders = {
    3:27,
    10:12,
    22:24,
    36:60,
    40:64,
    49:93,
    55:77,
    66:88,
    87:107,
    74:96,
    104:128,
    100:124
};

const snakes = {
    17:8,
    41:21,
    38:31,
    34:14,
    45:42,
    70:50,
    79:51,
    92:68,
    96:72,
    102:78,
    111:91,
    130:33
};

io.on("connection", (socket)=>{
    console.log("User connected: ",socket.id);
    
    socket.on("join_room", ({room, player})=>{
        // console.log('joined');
        // console.log(player)
        if(!rooms[room]){
            rooms[room] = [];
        }
        player = {...player, socketId: socket.id, index: rooms[room].length};
        socket.join(room);
        console.log(`User with id: ${socket.id} joined room: ${room}`)
        console.log(player);
        rooms[room].push(player);

        io.to(room).emit('players_update', rooms[room]);
    });

    socket.on('roll_dice', (data) => {
        console.log('rolling dice');
        const { room, rolledNum } = data;
    
        if (!rooms[room]) return;
    
        const toPlayPlayer = rooms[room][toPlayIndex];
    
        if (toPlayPlayer.socketId !== socket.id) return;
    
        let newPos = toPlayPlayer.position + rolledNum;
    
        if (snakes[newPos]) {
            newPos = snakes[newPos];
        }
    
        if (ladders[newPos]) {
            newPos = ladders[newPos];
        }
    
        if (newPos > 132) return;

        if (newPos === 132) {
            toPlayPlayer.position = newPos;
            toPlayIndex = (toPlayIndex + 1) % rooms[room].length;
            io.to(room).emit('players_update', rooms[room]);
            io.to(room).emit('update_turn_index', toPlayIndex);
            io.to(room).emit('game_winner', toPlayPlayer.name);
            return;
        }
    
        toPlayPlayer.position = newPos;
        toPlayIndex = (toPlayIndex + 1) % rooms[room].length;
    
        io.to(room).emit('players_update', rooms[room]);
        io.to(room).emit('update_turn_index', toPlayIndex);
    });

    socket.on("disconnect", ()=>{
        console.log("user disconnected: ", socket.id);
        for (const room in rooms) {
            const playerIndex = rooms[room].findIndex(player => player.socketId === socket.id);
        
            if (playerIndex !== -1) {
                rooms[room].splice(playerIndex, 1);

                if (rooms[room].length === 0) {
                delete rooms[room];
                } else {
                io.to(room).emit('players_update', rooms[room]);
                }
                break;
            }
        }
    });
});


server.listen(3001, ()=>{
    console.log('server running');
})