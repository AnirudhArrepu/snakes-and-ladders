import { useState } from "react";
import Grid from "./grid";
import PlayerCount from "./playerCount";
import Dice from "./dice";
import './app.css';

class Player{
    constructor(name, position, color){
        this.name = name;
        this.position = position;
        this.color = color;
    }
}

function App(){

    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState('');

    const ladders = {
        4:56,
        12:50,
        14:55,
        22:58,
        41:79,
        54:88
    };

    const snakes = {
        28:10,
        37:3,
        48:16,
        75:32,
        96:42,
        94:71
    };

    function addPlayer(name, position, color){
        var playernew = new Player(name, position, color);
        var playerslist = [...players, playernew];
        setPlayers(playerslist);
    }

    function updatePlayerPosition(index, rolledNum){
        setPlayers(prevPlayers =>{
            return prevPlayers.map((player, i) =>{
                if(i==index){
                    let newPosition = player.position + rolledNum;

                    if(snakes[newPosition]){
                        newPosition = snakes[newPosition];
                    }

                    if(ladders[newPosition]){
                        newPosition = ladders[newPosition];
                    }

                    if(newPosition > 100){
                        newPosition -= rolledNum;
                    }

                    if(newPosition == 100){
                        setWinner(player.name);
                    }

                    return { ...player, position: newPosition }
                }else{
                    return player;
                }
            });
        });
    }

    return (
        <div className="body">

            <div className="contentLeft">
                <Grid players={players}/>
            </div>

            <div className="contentRight">
                <Dice players={players} updatePlayerPosition={updatePlayerPosition} winner={winner}/>
                <PlayerCount addPlayer={addPlayer}/>
            </div>

        </div>
    )
}

export default App