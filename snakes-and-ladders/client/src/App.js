import { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import Grid from './components/grid';
import Dice from './components/dice';

const socket = io.connect('https://snakes-and-ladders-63f6.onrender.com')

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [players, setPlayers] = useState([]);
  const [color, setColor] = useState('#000000');
  const [myIndex, setMyIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [winner, setWinner] = useState('');
  
  useEffect(() => {
    socket.on('players_update', (playersData) => {
        setPlayers(playersData);
        setMyIndex(players.length -1);
        // console.log(myIndex);
    });

    socket.on('update_turn_index', (newTurnIndex) => {
      setTurnIndex(newTurnIndex);
    });

    socket.on('game_winner', (winner)=>{
      setWinner(winner);
    })

    return () => {
      socket.off('players_update');
      socket.off('update_turn_index');
      socket.off('game_winner');
    };
}, [players, turnIndex, winner]);
  
  const joinRoom = ()=>{
    if(username !== '' && room !== ''){
      const player = {
        name: username,
        color: color,
        position: 0,
      }
      console.log(username, room);
      socket.emit('join_room', {room, player});
      setShowGame(true);
    }
  }

  return (
    <div className="App">
      {!showGame ? (
        <div>
          <h3>Join game</h3>
          <input type='text' placeholder='Name' onChange={(event)=>{setUsername(event.target.value)}}/>
          <input type='text' placeholder='Room'onChange={(event)=>{setRoom(event.target.value)}}/>
          <input type='color' placeholder='Choose color' onChange={(event)=>{setColor(event.target.value)}}/>
          <button onClick={joinRoom}>Join</button>
        </div>)
        : (
          <div>
            <Grid players={players}/>
            <Dice players={players} index={myIndex} setIndex={setMyIndex} turnIndex={turnIndex} socket={socket} winner={winner} room={room}/>
          </div>
        )}
    </div>
  );
}

export default App;
