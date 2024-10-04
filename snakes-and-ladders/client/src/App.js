import { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import Grid from './components/grid';
import Dice from './components/dice';
import ShowGIF from './components/showGIF';

const socket = io.connect('http://localhost:3001')

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [players, setPlayers] = useState([]);
  const [color, setColor] = useState('#000000');
  // const [myIndex, setMyIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [winner, setWinner] = useState('');

  let gifs = {
    1: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    2: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    3: 'https://www.google.com/imgres?q=telugu%20gif%20about%20karma&imgurl=https%3A%2F%2Fmedia.tenor.com%2FbAkbr_b46GYAAAAM%2Fnaa-karma-na-karma.gif&imgrefurl=https%3A%2F%2Ftenor.com%2Fview%2Fkarma-ra-babu-sticker-thala-kottukovadam-cha-my-karma-gif-19099055&docid=WC5gyHoZGChb1M&tbnid=lgz2lNG1UjriFM&vet=12ahUKEwjF1KvxrO-IAxUGiK8BHYi4Nn0QM3oECGcQAA..i&w=220&h=125&hcb=2&ved=2ahUKEwjF1KvxrO-IAxUGiK8BHYi4Nn0QM3oECGcQAA',
    4: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    5: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    6: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    7: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    8: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fin.pinterest.com%2Fpin%2Ftelugu-brahmi-gif-telugu-brahmi-telugucomedy-discover-share-gifs--694328467529047753%2F&psig=AOvVaw09m9ByqaommIAak0aEoRP7&ust=1727946830503000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKj14Nyt74gDFQAAAAAdAAAAABAw',
    9: 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
    10:'https://miro.medium.com/v2/resize:fit:640/format:webp/1*AmI9wRbXrfIWGESx6eEiTw.gif',
  }
  
  useEffect(() => {
    socket.on('players_update', (playersData) => {
        setPlayers(playersData);
        // setMyIndex(players.length -1);
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
        <div className='joiningdiv'>
          <h3>Join game</h3>
          <input type='text' placeholder='Name' onChange={(event)=>{setUsername(event.target.value)}}/>
          <input type='text' placeholder='Room'onChange={(event)=>{setRoom(event.target.value)}}/>
          <input type='color' className= "colorbutton" placeholder='Choose color' onChange={(event)=>{setColor(event.target.value)}}/>
          <button className="joinbutton" onClick={joinRoom}>Join</button>
        </div>)
        : (
          <div className='content'>

            <div className='content left'>
              <Grid players={players}/>
            </div>

            <div className='content right'>
              <div className='showgif'>
                <ShowGIF players={players} username={username} gifs={gifs}/>
              </div>
              <div className='showdice'>
                <Dice players={players} turnIndex={turnIndex} socket={socket} winner={winner} room={room}/>
              </div>
            </div>

          </div>
        )}
    </div>
  );
}

export default App;
