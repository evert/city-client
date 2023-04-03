let ctx;

const tileSize = 32;

function main() {

  const canvas = document.getElementById('game');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const observer = new ResizeObserver((entries) => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  observer.observe(canvas)

  render();

  window.addEventListener('resize', () => {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  });

}

const width = 200;
const height = 200;

const map = range(height, () => range(width, () => chance(3) ? rand(0,200): 0));

function render() {

  window.requestAnimationFrame( () => {
    draw(ctx);
    render();
  });

}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function draw(ctx) {

  for(let y=0; y<height; y++) {

    for(let x=0; x<width; x++) {

      drawCell(ctx, x, y, map[y][x]);

    }

  }

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} cell
 */
function drawCell(ctx, x, y, cell) {

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x*tileSize, y*tileSize);
  ctx.drawImage(
    tiles,
    0, cell * 16, 16, 16,
    0, 0, tileSize, tileSize,
  );
  ctx.restore();

}


function range(num, valueCb) {

  const r = [];
  for (let i=0; i<num; i++) {

    if (typeof valueCb === 'function') {
      r.push(valueCb(i));
    } else {
      r.push(valueCb);
    }
  }
  return r;

}

const tiles = new Image();
tiles.src = 'images/png/tiles.png';

/**
 * @param {number} min Lower boundary (inclusive)
 * @param {number} max Upper boundary (exclusive)
 * @returns {number}
 */
export function rand(min, max) {

  return Math.floor((Math.random()*(max-min))+min);

}

/**
 * @param {number} max
 * @returns {boolean}
 */
export function chance(max) {

  return rand(0, max)===0;

}


document.addEventListener('DOMContentLoaded', main);
