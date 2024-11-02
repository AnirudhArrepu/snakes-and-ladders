import React, { useEffect, useRef } from 'react';
import './grid.css';

function Grid({ players, snakes, ladders, cellData }) {
    const canvasRef = useRef(null);
    const canvasRef2 = useRef(null);
    const grid = generate();

    useEffect(() => {
        drawSnakes();
        drawLadders();
    }, []);

    const drawSnakes = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;

        snakes.forEach(snake => {
            for (let i = 0; i < snake.length - 1; i++) {
                const start = snake[i];
                const end = snake[i + 1];
                const startPos = getCoordinates(start);
                const endPos = getCoordinates(end);
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(endPos.x, endPos.y);
                ctx.stroke();
            }
        });
    };

    const drawLadders = () => {
        const canvas = canvasRef2.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 5;

        ladders.forEach(ladder => {
            for (let i = 0; i < ladder.length - 1; i++) {
                const start = ladder[i];
                const end = ladder[i + 1];
                const startPos = getCoordinates(start);
                const endPos = getCoordinates(end);
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(endPos.x, endPos.y);
                ctx.stroke();
            }
        });
    };

    const getCoordinates = (number) => {
        const cols = 11;
        const index = grid.indexOf(number);
        const x = (index % cols) * 73 + 45;
        const y = Math.floor(index / cols) * 70 + 40;
        return { x, y };
    };

    return (
        <>
            <div className='grid'>
                {grid.map((number, index) => (
                    <Square key={index} number={number} players={players} cellData={cellData} />
                ))}
                <canvas ref={canvasRef} className="overlay" width={800} height={840} />
                <canvas ref={canvasRef2} className="overlay" width={800} height={840} />
            </div>
        </>
    );
}

function generate() {
    let rows = 12;
    let cols = 11;
    let squares = [];
    let counter = rows * cols;

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

function Square({ number, players, cellData }) {
    
    const squareDesc = {};
    cellData.forEach((cell, index) => {
        squareDesc[index + 1] = cell;
    });


    const playersOnSquare = players ? players.filter(player => player.position === number) : [];

    let backgroundImage = null;
    try {
        backgroundImage = require(`./cells/${number}.png`);
    } catch (error) {
    }

    return (
        <div className='square' style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {playersOnSquare.map((player, index) => (
                <div key={index} className={`player player-${index}`} style={{ backgroundColor: player.color }} />
            ))}
            <div className="pos">
                {number}
            </div>
            <div className="about-pos telugu-text">
                {squareDesc[number]}
            </div>

            <div className="hover-banner">
                {squareDesc[number]} : {number}
            </div>
        </div>
    );
}

export default Grid;
