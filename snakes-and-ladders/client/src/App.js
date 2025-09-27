import { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import Grid from './components/grid';
import Dice from './components/dice';
import Papa from 'papaparse';
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
  const [snakesData, setSnakesData] = useState([[]]);
  const [laddersData, setLaddersData] = useState([[]]);
  const [cellData, setCellData] = useState([[]]);
  const [chosenLanguage, setChosenLanguage] = useState(1);
  
  useEffect(() => {
    //loading snakes.csv
    fetch("/snakes.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setSnakesData((prevData) => [
              ...prevData,
              ...result.data.map((row) => Object.values(row))
            ]);
          },
        });
      }
    );
    fetch("/ladders.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setLaddersData((prevData) => [
              ...prevData,
              ...result.data.map((row) => Object.values(row))
            ]);
          },
        });
      }
    );
    fetch("/cells.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setCellData((prevData) => [
              ...prevData,
              ...result.data.map((row) => Object.values(row))              
            ]);
          },
        });
      }
    );

    console.log(cellData);
    



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
          <select name="Choose language" onChange={(e) => {
              const selectedValue = parseInt(e.target.value, 10);
              console.log(selectedValue);
              setChosenLanguage(selectedValue);
            }}>
            <option value="1">Malayalam</option>
            <option value="0">Telugu</option>
            <option value="2">Tamil</option>
            <option value="3">Hindi</option>
          </select>
          <button className="joinbutton" onClick={joinRoom}>Join</button>

        </div>)
        : (
          <div className='content'>

            <div className='content left'>
              <Grid players={players} snakes={snakesData} ladders={laddersData} cellData={cellData[chosenLanguage+1]}/>
            </div>

            <div className='content right'>
              <div className='showgif'>
                {/* <ShowGIF players={players} username={username} gifs={gifs}/> */}
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
