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
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Helpers
      const catmull = (p0, p1, p2, p3, t) => {
        // Catmull-Rom to get smooth interpolation through points
        const t2 = t * t;
        const t3 = t2 * t;
        return {
          x:
            0.5 *
            (2 * p1.x +
              (-p0.x + p2.x) * t +
              (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
              (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y:
            0.5 *
            (2 * p1.y +
              (-p0.y + p2.y) * t +
              (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
              (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        };
      };

      const lerp = (a, b, t) => a + (b - a) * t;

      snakes.forEach((snake) => {
        if (!snake || snake.length < 2) return;

        // Convert cell numbers -> pixel points
        const points = snake.map((n) => getCoordinates(n));

        // Sample the spline to get a smooth sequence of points along the body
        const samples = [];
        const perSegment = 16; // increase for smoother curve
        if (points.length === 2) {
          // simple linear sampling if only two points
          for (let s = 0; s <= perSegment; s++) {
            const t = s / perSegment;
            samples.push({
              x: lerp(points[0].x, points[1].x, t),
              y: lerp(points[0].y, points[1].y, t),
            });
          }
        } else {
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            for (let s = 0; s < perSegment; s++) {
              samples.push(catmull(p0, p1, p2, p3, s / perSegment));
            }
          }
          // push final point
          samples.push(points[points.length - 1]);
        }

        if (samples.length < 2) return;

        // Build left/right outlines by offsetting by normals (variable width)
        const left = [],
          right = [];
        const widthHead = 22; // width at head
        const widthTail = 6; // width at tail
        for (let i = 0; i < samples.length; i++) {
          const prev = samples[i - 1] || samples[i];
          const next = samples[i + 1] || samples[i];
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len; // normal x
          const ny = dx / len; // normal y
          const t = i / (samples.length - 1);
          const w = lerp(widthHead, widthTail, t);
          left.push({
            x: samples[i].x + nx * (w / 2),
            y: samples[i].y + ny * (w / 2),
          });
          right.push({
            x: samples[i].x - nx * (w / 2),
            y: samples[i].y - ny * (w / 2),
          });
        }

        // Draw body shadow (slightly offset, blurred)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left[0].x + 6, left[0].y + 6);
        for (let i = 1; i < left.length; i++)
          ctx.lineTo(left[i].x + 6, left[i].y + 6);
        for (let i = right.length - 1; i >= 0; i--)
          ctx.lineTo(right[i].x + 6, right[i].y + 6);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(0,0,0,0.24)";
        ctx.fill();
        ctx.restore();

        // Fill body with gradient from head -> tail
        const headPt = samples[0];
        const tailPt = samples[samples.length - 1];
        const grad = ctx.createLinearGradient(
          headPt.x,
          headPt.y,
          tailPt.x,
          tailPt.y
        );
        grad.addColorStop(0, "#2b7a3a");
        grad.addColorStop(0.45, "#74c05a");
        grad.addColorStop(1, "#153a20");

        ctx.beginPath();
        ctx.moveTo(left[0].x, left[0].y);
        for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
        for (let i = right.length - 1; i >= 0; i--)
          ctx.lineTo(right[i].x, right[i].y);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Add darker scales/stripes along the body (ellipses rotated along tangent)
        for (
          let i = 4;
          i < samples.length - 4;
          i += Math.max(3, Math.floor(samples.length / 12))
        ) {
          const p = samples[i];
          const prev = samples[i - 1];
          const next = samples[i + 1];
          const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
          // width at this point (recompute similar to above)
          const t = i / (samples.length - 1);
          const w = lerp(widthHead, widthTail, t);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, w * 0.36, Math.max(3, w * 0.12), 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fill();
          ctx.restore();
        }

        // Draw a subtle central ridge highlight
        ctx.beginPath();
        ctx.moveTo(samples[0].x, samples[0].y);
        for (let i = 1; i < samples.length; i++)
          ctx.lineTo(samples[i].x, samples[i].y);
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw head (pointed filled shape connecting the left/right base)
        if (samples.length >= 2) {
          const a = samples[0];
          const b = samples[1];
          const tx = b.x - a.x;
          const ty = b.y - a.y;
          const tlen = Math.hypot(tx, ty) || 1;
          const ux = tx / tlen;
          const uy = ty / tlen;
          const headLen = widthHead * 1.6;
          const tip = { x: a.x - ux * headLen, y: a.y - uy * headLen };

          ctx.beginPath();
          ctx.moveTo(left[0].x, left[0].y);
          // curve to tip for smoother head
          ctx.quadraticCurveTo(a.x, a.y, tip.x, tip.y);
          ctx.quadraticCurveTo(a.x, a.y, right[0].x, right[0].y);
          ctx.closePath();
          ctx.fillStyle = "#194e28";
          ctx.fill();

          // head glossy highlight
          ctx.beginPath();
          ctx.moveTo(a.x - ux * 6 - uy * 6, a.y - uy * 6 + ux * 6);
          ctx.quadraticCurveTo(
            a.x - ux * 8,
            a.y - uy * 8,
            a.x - ux * 14,
            a.y - uy * 14
          );
          ctx.strokeStyle = "rgba(255,255,255,0.18)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Eyes (two small dots)
          const eyeOffset = widthHead * 0.28;
          const normalX = -uy; // perpendicular to tangent
          const normalY = ux;
          const eye1 = {
            x: a.x + normalX * eyeOffset - ux * 6,
            y: a.y + normalY * eyeOffset - uy * 6,
          };
          const eye2 = {
            x: a.x - normalX * eyeOffset - ux * 6,
            y: a.y - normalY * eyeOffset - uy * 6,
          };

          ctx.beginPath();
          ctx.fillStyle = "#000";
          ctx.arc(
            eye1.x,
            eye1.y,
            Math.max(1.5, widthHead * 0.08),
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            eye2.x,
            eye2.y,
            Math.max(1.5, widthHead * 0.08),
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Forked tongue
          const tongueLen = Math.max(18, widthHead * 0.9);
          const tongueBase = { x: a.x - ux * 8, y: a.y - uy * 8 };
          const fork = 6;
          ctx.beginPath();
          ctx.moveTo(tongueBase.x, tongueBase.y);
          ctx.lineTo(
            tongueBase.x - ux * tongueLen + normalX * fork,
            tongueBase.y - uy * tongueLen + normalY * fork
          );
          ctx.moveTo(tongueBase.x, tongueBase.y);
          ctx.lineTo(
            tongueBase.x - ux * tongueLen - normalX * fork,
            tongueBase.y - uy * tongueLen - normalY * fork
          );
          ctx.strokeStyle = "#d00000";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // tail cap: small circle at tail end
        const tail = samples[samples.length - 1];
        ctx.beginPath();
        ctx.fillStyle = "#0e3b1a";
        ctx.arc(tail.x, tail.y, Math.max(3, widthTail / 1.8), 0, Math.PI * 2);
        ctx.fill();
      });
    };


    const drawLadders = () => {
      const canvas = canvasRef2.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ladders.forEach((ladder) => {
        if (!ladder || ladder.length < 2) return;

        for (let i = 0; i < ladder.length - 1; i++) {
          const start = getCoordinates(ladder[i]);
          const end = getCoordinates(ladder[i + 1]);

          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const railSpacing = 25; // space between rails
          const rungSpacing = 35; // space between rungs
          const rungCount = Math.floor(length / rungSpacing);

          // Wood gradient (for rails)
          const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
          grad.addColorStop(0, "#8B5A2B");
          grad.addColorStop(0.5, "#CD853F");
          grad.addColorStop(1, "#8B5A2B");

          // Slight taper for perspective
          const railWidthTop = 8;
          const railWidthBottom = 5;

          // Apply shadow for depth
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 3;

          // Draw both rails (left & right)
          const drawRail = (offset) => {
            ctx.beginPath();
            ctx.moveTo(
              start.x + offset * Math.sin(angle),
              start.y - offset * Math.cos(angle)
            );
            ctx.lineTo(
              end.x + offset * Math.sin(angle),
              end.y - offset * Math.cos(angle)
            );
            const gradRail = ctx.createLinearGradient(
              start.x,
              start.y,
              end.x,
              end.y
            );
            gradRail.addColorStop(0, "#7b3f00");
            gradRail.addColorStop(0.5, "#d2a679");
            gradRail.addColorStop(1, "#7b3f00");
            ctx.strokeStyle = gradRail;
            ctx.lineWidth = (i === 0 ? railWidthTop : railWidthBottom) + 1;
            ctx.lineCap = "round";
            ctx.stroke();

            // Gloss line along one side
            ctx.beginPath();
            ctx.moveTo(
              start.x + offset * Math.sin(angle) + 2,
              start.y - offset * Math.cos(angle) + 2
            );
            ctx.lineTo(
              end.x + offset * Math.sin(angle) + 2,
              end.y - offset * Math.cos(angle) + 2
            );
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          };

          drawRail(-railSpacing / 2);
          drawRail(railSpacing / 2);

          ctx.shadowBlur = 0; // reset shadow for rungs

          // Draw rungs (steps)
          for (let r = 0; r <= rungCount; r++) {
            const t = r / rungCount;
            const rungX = start.x + dx * t;
            const rungY = start.y + dy * t;

            const offsetX = (railSpacing / 2) * Math.sin(angle);
            const offsetY = (railSpacing / 2) * Math.cos(angle);

            // Draw rung (with gradient and metallic bolts)
            const rungGrad = ctx.createLinearGradient(
              rungX - offsetX,
              rungY + offsetY,
              rungX + offsetX,
              rungY - offsetY
            );
            rungGrad.addColorStop(0, "#8B4513");
            rungGrad.addColorStop(0.4, "#DEB887");
            rungGrad.addColorStop(1, "#8B4513");

            ctx.beginPath();
            ctx.moveTo(rungX - offsetX, rungY + offsetY);
            ctx.lineTo(rungX + offsetX, rungY - offsetY);
            ctx.lineWidth = 6;
            ctx.strokeStyle = rungGrad;
            ctx.lineCap = "round";
            ctx.stroke();

            // Rung highlight (top shine)
            ctx.beginPath();
            ctx.moveTo(rungX - offsetX + 1, rungY + offsetY - 1);
            ctx.lineTo(rungX + offsetX - 1, rungY - offsetY + 1);
            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Add bolts on both ends
            ctx.beginPath();
            ctx.fillStyle = "#2e2e2e";
            ctx.arc(rungX - offsetX, rungY + offsetY, 2.5, 0, Math.PI * 2);
            ctx.arc(rungX + offsetX, rungY - offsetY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Remove shadows to avoid affecting next ladder
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
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
