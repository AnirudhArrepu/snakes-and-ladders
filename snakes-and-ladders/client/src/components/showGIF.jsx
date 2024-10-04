function ShowGIF({players, username, gifs}){

    const player = players.find(player => player.name === username);
    const index = player? player.position : 1;
    // const index = 1;

    return(
        <div>
            {gifs[index] ?(
                <div>
                    <img
                        className="gif"
                        src={gifs[index]}
                        alt={'gif'}
                    />
                </div>
            ):<div></div>}
        </div>
    )
}

export default ShowGIF