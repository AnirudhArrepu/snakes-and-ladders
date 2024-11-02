// function ShowGIF({players, username, gifs}){
function ShowGIF({players, username, gifs, data}){
    const player = players.find(player => player.name === username);
    const index = player? player.position : 1;

    return(
        <div>
            {/* {gifs[index] ?(
                <div>
                    <img
                        className="gif"
                        src={gifs[index]}
                        alt={'gif'}
                    />
                </div>
            ):<div></div>} */}

            {/* {data[index] ?(
                <div>
                    <h4>{data[heading]}</h4>
                    <img
                        className="gif"
                        src={data[index]}
                        alt={'gif'}
                    />
                    <p>{data[des]}</p>
                </div>
            ):<div></div>} */}

        </div>
    )
}

export default ShowGIF