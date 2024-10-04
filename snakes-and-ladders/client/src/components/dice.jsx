import { useState, useEffect } from "react"
import './dice.css';
function Dice({players, winner, socket, turnIndex, room}){
    const [rolledNum, setRolledNum] = useState(0);
    const size = players.length;
    const [yourTurn, setYourTurn] = useState(true);

    // useEffect(() => {
    //     // if (players.length > 0) {
    //     //   setYourTurn(turnIndex === index);
    //     // }
    //     socket.on('update_turn_index', (turnIndex) => {
    //         // setIndex(turnIndex);
    //         setYourTurn(turnIndex === index);
    //     });

    //     return () => {
    //         socket.off('update_turn_index');
    //     };
    //   }, [players, turnIndex, index, socket]);

    function roll() {
            const rolled = Math.floor(Math.random() * 6) + 1;
            setRolledNum(rolled);
            socket.emit('roll_dice', { room: room, rolledNum: rolled });
    }

    return (
        <div className="diceBody">
            {winner === '' ? (
                size > 1 ? ( 
                    <>
                        <div className="numberRolled line">Number: {rolledNum}</div>
                        <div className="playerCall line">Player {turnIndex + 1}'s turn!</div>
                        {yourTurn ? 
                        <button onClick={roll} className="roll line">ROLL</button> : <div></div>}
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