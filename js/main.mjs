// @ts-check
import { chance, rand, range } from './util.mjs';
import { MapData } from './map.mjs';

/**
 * @type {CanvasRenderingContext2D}
 */
let ctx;

/**
 * How big each map tile is in pixels
 */
let tileSize = 16;

/**
 * Total size of the canvas. This changes with resizes.
 */
let canvasDimensions = [window.innerWidth, window.innerHeight];

/**
 * The size of the canvas as measured in tiles.
 */
let tileDimensions = [
  Math.ceil(window.innerWidth/tileSize),
  Math.ceil(window.innerHeight/tileSize)
];

/**
 * The x and y offset of how far the user has scrolled.
 *
 * This is measured in pixels, not tiles.
 */
//let viewportOffset = [2576192,1951424];
//let viewportOffset = [1158944,534176]
//let viewportOffset = [rand(0,129600*tileSize), rand(0,64800*tileSize)];
let viewportOffset = [36232*tileSize+10000,16688*tileSize+10000];


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

  window.addEventListener('pointerdown', canvasMouseDown);
  window.addEventListener('pointerup', canvasMouseUp);
  canvas.addEventListener('pointermove', canvasMouseMove);

  render();

}

const width = 1000;
const height = 1000;

const map = new MapData();

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
      if (map.get(cellX, cellY) === undefined) continue;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(
         (x*tileSize) - (viewportOffset[0] % tileSize),
         (y*tileSize) - (viewportOffset[1] % tileSize)
      );
      drawCell(ctx, map.get(cellX, cellY));
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

  if (!mouseDown) return;

  let xDiff = ev.x - lastMouseXY[0];
  let yDiff = ev.y - lastMouseXY[1];

  viewportOffset = [
    Math.max(0, lastViewportOffset[0] - xDiff),
    Math.max(0, lastViewportOffset[1] - yDiff),
  ];
}

const tiles = new Image();
tiles.src = 'images/png/tiles.png';

document.addEventListener('DOMContentLoaded', main);
