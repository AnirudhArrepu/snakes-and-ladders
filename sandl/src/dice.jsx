import { useState } from "react"
import './dice.css';

function Dice({players, updatePlayerPosition, winner}){
    const [rolledNum, setRolledNum] = useState(0);
    const [index, setIndex] = useState(0);
    const size = players.length;

    function roll(){
        if (size > 1) {
            const rolled = Math.floor(Math.random() * 6) + 1;
            setRolledNum(rolled);
            updatePlayerPosition(index, rolled);
            setIndex((index + 1) % size);
        }
    }

    return (
        <div className="diceBody">
            {winner === '' ? (
                size > 1 ? (
                    <>
                        <div className="numberRolled">Number: {rolledNum}</div>
                        <div className="playerCall">Player {index + 1}'s turn!</div>
                        <button onClick={roll} className="roll">ROLL</button>
                    </>
                ) : (
                    <div>Add players to start</div>
                )
            ) : (
                <div>{winner} is the winner!</div>
            )}
        </div>
    );
}

export default Dice;
