import { useState, useRef, useEffect } from "react";
import "./dice.css";

function Dice({ players, winner, socket, turnIndex, room }) {
  const [rolledNum, setRolledNum] = useState(0); // final number
  const [displayFace, setDisplayFace] = useState(1); // shown while rolling
  const [isRolling, setIsRolling] = useState(false);
  const size = players.length;
  const [yourTurn, setYourTurn] = useState(true); // keep existing behaviour
  const rollIntervalRef = useRef(null);

  // mapping of visible dot positions for each face (3x3 grid positions 1..9)
  const faceMap = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  useEffect(() => {
    // cleanup interval on unmount
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }
    };
  }, []);

  function roll() {
    if (isRolling) return;
    setIsRolling(true);

    // show rapidly changing faces
    rollIntervalRef.current = setInterval(() => {
      const rand = Math.floor(Math.random() * 6) + 1;
      setDisplayFace(rand);
    }, 80);

    const animationDuration = 1000; // ms

    setTimeout(() => {
      // stop animation and set final value
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }

      const finalRolled = Math.floor(Math.random() * 6) + 1;
      setRolledNum(finalRolled);
      setDisplayFace(finalRolled);

      // emit the final roll to server
      if (socket && room) {
        socket.emit("roll_dice", { room: room, rolledNum: finalRolled });
      }

      setIsRolling(false);
    }, animationDuration);
  }

  // UI when not enough players or winner declared
  if (winner && winner !== "") {
    return <div className="diceBody">{winner} is the winner!</div>;
  }

  return (
    <div className="diceBody">
      {size <= 1 ? (
        <div>Add players to start</div>
      ) : (
        <>
          <div className="numberRolled line">
            <div className={`dice ${isRolling ? "rolling" : ""}`} aria-hidden>
              {/* 3x3 grid cells (1..9) */}
              {Array.from({ length: 9 }).map((_, idx) => {
                const pos = idx + 1;
                const visible = faceMap[displayFace]?.includes(pos);
                return (
                  <div className="cell" key={pos}>
                    <span className={`dot ${visible ? "visible" : ""}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="playerCall line">Player {turnIndex + 1}'s turn!</div>

          <div className="controls">
            {yourTurn ? (
              <button
                onClick={roll}
                className="roll"
                disabled={isRolling}
                aria-disabled={isRolling}
              >
                {isRolling ? "Rolling..." : "ROLL"}
              </button>
            ) : (
              <button className="roll disabled" disabled>
                Wait
              </button>
            )}

            <div className="finalNumber">Last: {rolledNum || "-"}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dice;
