import { useState } from "react"
import './playercount.css';

function PlayerCount({addPlayer}){
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000')

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleColorChange = (event) => {
        setColor(event.target.value);
    };

    const handleAddPlayer = () => {
        addPlayer(name, 0, color);
        console.log('prolly added');
        setName('');
        setColor('#000000');
    };

    return (
        <div className="playerBody">
            <div>
                Enter name:
                <input type="text" value={name} onChange={handleNameChange}/>
            </div>
            <div>
                Choose color:
                <input type="color" name="playerColor" id="chosenColor" value={color} onChange={handleColorChange}/>
            </div>
            <div>
                <button onClick={handleAddPlayer}>ADD</button>
            </div>
        </div>
    )
}

export default PlayerCount