import { useState, useEffect } from "react"

function Dice({players, winner, index, setIndex, socket, turnIndex, room}){
    const [rolledNum, setRolledNum] = useState(0);
    const size = players.length;
    const [yourTurn, setYourTurn] = useState(false);

    useEffect(() => {
        if (players.length > 0) {
          setYourTurn(turnIndex === index);
        }
        socket.on('update_turn_index', (turnIndex) => {
            setIndex(turnIndex);
        });

        return () => {
            socket.off('update_turn_index');
        };
      }, [players, turnIndex]);

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
                        <div className="numberRolled">Number: {rolledNum}</div>
                        <div className="playerCall">Player {turnIndex + 1}'s turn!</div>
                        {yourTurn ? 
                        <button onClick={roll} className="roll">ROLL</button> : <div></div>}
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