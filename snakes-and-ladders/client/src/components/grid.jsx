import './grid.css'

function Grid({ players }) {
    const grid = generate();
    return (
        <>
            <div className='grid'>
                {grid.map((number, index) => (
                    <Square key={index} number={number} players={players} />
                ))}
            </div>
        </>
    )
}

function generate() {
    // let size = 10;
    let rows = 12;
    let cols = 11;
    let squares = [];
    let counter = rows*cols;

    for (let row = 0; row < rows; row++) {
        let rowSquares = [];
        for (let col = 0; col < cols; col++) {
            rowSquares.push(counter);
            counter--;
        }
        if (row % 2 === 1) {
            rowSquares.reverse();
        }
        squares = squares.concat(rowSquares);
    }
    return squares;
}

function Square({ number, players }) {
    const playersOnSquare = players ? players.filter(player => player.position === number) : [];

    return (
        <div className='square'>
            {playersOnSquare.map((player, index) => (
                <div key={index} className={`player player-${index}`} style={{ backgroundColor: player.color }} />
            ))}
        </div>
    )
}

export default Grid;
