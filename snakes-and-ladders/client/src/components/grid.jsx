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

    const squareDesc = {
        3: "కర్ణుడు",
        8: "అహంకారం",
        10: "వికర్ణ",
        22: "అర్జునా",
        21: "అసూయ",
        14: "కోపం",
        33: "అమానవీయ",
        31: "మోసం",
        42: "దయలేని",
        40: "ఏక్లవ్య",
        36: "విధురర్",
        55: "భీమా",
        51: "గర్వము",
        50: "అజ్ఞానం",
        49: "భీష్మ",
        66: "ద్రౌపది",
        68: "సోమరితనం",
        72: "నిజాయితీ",
        74: "గంగా",
        78: "దురాశ",
        87: "అంబికా",
        100: "గాంధారి",
        111: "అహం",
    }

    const playersOnSquare = players ? players.filter(player => player.position === number) : [];

    return (
        <div className='square'>
            {playersOnSquare.map((player, index) => (
                <div key={index} className={`player player-${index}`} style={{ backgroundColor: player.color }} />
            ))}
            <div className="pos">
                {number}
            </div>
            <div className="about-pos telugu-text">
                {squareDesc[number]}
            </div>

        </div>
    )
}

export default Grid;
