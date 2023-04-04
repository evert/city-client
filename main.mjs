// @ts-check
let ctx;

const tileSize = 32;

let canvasDimensions = [window.innerWidth, window.innerHeight];
let tileDimensions = [Math.ceil(window.innerWidth/tileSize), Math.ceil(window.innerHeight/tileSize)];
let viewportOffset = [0,0];

function main() {

  const canvas = /** @type HTMLCanvasElement */ (document.getElementById('game'));
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const observer = new ResizeObserver((entries) => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasDimensions = [window.innerWidth, window.innerHeight];
    tileDimensions = [
      Math.ceil(window.innerWidth/tileSize),
      Math.ceil(window.innerHeight/tileSize)
    ];
  });
  observer.observe(canvas)

  window.addEventListener('mousedown', canvasMouseDown);
  window.addEventListener('mouseup', canvasMouseUp);
  canvas.addEventListener('mousemove', canvasMouseMove);

  render();

}

const width = 1000;
const height = 1000;

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

  for(let y=-1; y<tileDimensions[1]+1; y++) {

    for(let x=-1; x<tileDimensions[0]+1; x++) {

      const cellX = Math.floor(viewportOffset[0]/tileSize + x);
      const cellY = Math.floor(viewportOffset[1]/tileSize + y);
      if (map[cellY]?.[cellX] === undefined) continue;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(
         (x*tileSize) - (viewportOffset[0] % tileSize),
         (y*tileSize) - (viewportOffset[1] % tileSize)
      );
      drawCell(ctx, map[cellY][cellX]);
      ctx.restore();

    }

  }

}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cell
 */
function drawCell(ctx, cell) {

  ctx.drawImage(
    tiles,
    0, cell * 16, 16, 16,
    0, 0, tileSize, tileSize,
  );

}

let mouseDown = false;
let lastMouseXY = [0,0];
let lastViewportOffset = [0,0];
/**
 * @param {MouseEvent} ev
 */
function canvasMouseDown(ev) {
  mouseDown = true;
  lastMouseXY = [ev.x, ev.y];
  lastViewportOffset = [...viewportOffset];
}
function canvasMouseUp() {
  mouseDown = false;
}

/**
 * @param {MouseEvent} ev
 */
function canvasMouseMove(ev) {

  if (!mouseDown || ev.button!=0) return;
  console.log(ev.button);

  let xDiff = ev.x - lastMouseXY[0];
  let yDiff = ev.y - lastMouseXY[1];

  viewportOffset = [
    Math.max(0, lastViewportOffset[0] - xDiff),
    Math.max(0, lastViewportOffset[1] - yDiff),
  ];
}


/**
 * Creates an array of length num, and fills it with the result
 * of the callback.
 *
 * @param {number} num
 * @param {(idx: number) => any} valueCb
 * @returns {any[]}
 */
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
