import './grid.css'

function Grid({players}){
    const grid = generate();
    return(
        <>
            <div className='grid'>
                {grid.map((number,index)=>(
                    <Square key={index} number={number} players={players}/>
                ))}
            </div>
        </>
    )
}

function generate(){
    let size = 10;
    let squares = [];
    let counter = size * size;
    
    for (let row = 0; row < size; row++) {
        let rowSquares = [];
        for (let col = 0; col < size; col++) {
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

function Square({number, players}){
    var backgroundColor = 'transparent';
    
    if(players){
        for(const player of  players){
            if(player.position == number){
                backgroundColor = player.color;
            }
        }
    }

    return (
        <button className='square' style={{backgroundColor: backgroundColor}}/>
    )
}

export default Grid