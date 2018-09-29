const canvasSketch = require('canvas-sketch');
const { range } = require('canvas-sketch-util/random');
const R = require('ramda');
const quintInOut = require('eases/quint-in-out');
const ticker = require('tween-ticker')({ defaultEase: quintInOut });
const Tween = require('tween-chain');
const chroma = require('chroma-js');
const { rectGrid } = require('./grid');
const { drawShape } = require('./geometry');

const settings = {
  dimensions: [800, 800],
  animate: true,
  duration: 5,
  scaleToView: true,
  fps: 60,
};

const sketch = () => {
  console.clear();
  let pts = [];

  return {
    begin({ context, width, height }) {
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      context.lineJoin = 'bevel';
      // Create a grid
      pts = rectGrid({
        size: { x: width, y: height },
        resolution: { x: 16, y: 16 },
        padding: { x: 0.15, y: 0.15 },
      }).reduce((acc, { x, y, s, step, yIdx, xIdx }) => {
        const even = yIdx % 2 === 0;
        const offsetX = even ? step.x / 2 : 0;
        const offsetY = even ? step.y : -step.y;
        const r = s.x / 8;
        const pt = { x: x - range(step.x, step.x * 8), y, opacity: 0, r };

        const chain = Tween()
          .chain(pt, { x, opacity: 1, r, duration: 1.6 })
          .then(pt, { x: x + offsetX, r: r * 1.2, duration: 0.4 })
          .then(pt, {
            x: x,
            y: y + offsetY,
            delay: 0.4,
            duration: 0.6,
          })
          .then(pt, { y, r: r * 1.6, delay: 0.8, duration: 0.4 })
          .then(pt, {
            opacity: 0,
            delay: 0.4,
            duration: 0.3,
          });

        ticker.push(chain);

        return acc.concat([pt]);
      }, []);
    },
    render({ context, width, height, deltaTime }) {
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      context.lineJoin = 'bevel';

      ticker.tick();

      pts.forEach(({ x, y, r, opacity }) => {
        context.globalAlpha = opacity;

        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.fill();
      });
    },
  };
};

canvasSketch(sketch, settings);
