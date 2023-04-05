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
 * @type {HTMLCanvasElement}
 */
let canvas;

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

const tiles = new Image();
tiles.src = 'images/png/tiles.png';

/**
 * The x and y offset of how far the user has scrolled.
 *
 * This is measured in pixels, not tiles.
 */
//let viewportOffset = [2576192,1951424];
//let viewportOffset = [1158944,534176]
//let viewportOffset = [rand(0,129600*tileSize), rand(0,64800*tileSize)];

// toronto
let viewportOffset = [36232*tileSize-Math.floor(canvasDimensions[0]/2),16688*tileSize-Math.floor(canvasDimensions[1]/2)];

// netherlands
// let viewportOffset = [66239,13678].map( i => i*tileSize);

function main() {

  canvas = /** @type HTMLCanvasElement */ (document.getElementById('game'));
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const observer = new ResizeObserver((entries) => {
    updateViewPort();
    requestDraw();
  });
  observer.observe(canvas)

  window.addEventListener('pointerdown', canvasMouseDown);
  window.addEventListener('pointerup', canvasMouseUp);
  canvas.addEventListener('pointermove', canvasMouseMove);

  window.addEventListener('wheel', wheel);

  const search = document.getElementById('search');
  search.addEventListener('keyup', searchChange);

  requestDraw();

}
document.addEventListener('DOMContentLoaded', main);

const width = 1000;
const height = 1000;

const map = new MapData(() => requestDraw());

let rafKey = null;
function requestDraw() {
  if (rafKey) return;
  rafKey = requestAnimationFrame(() => {
    rafKey = null;
    draw(ctx);
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
  requestDraw();
}

/**
 * @param {number} lat
 * @param {number} lng
 */
async function gotoGps(lat, lng) {

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });
  const res = await fetch('/gps-to-tile?' + params.toString());
  const body = await res.json();

  setTileCenter(
    body.x,
    body.y,
  );
  requestDraw();

}

/**
 * @returns {[number, number]}
 */
function getTileCenter() {
  return [
    Math.round((viewportOffset[0] + canvasDimensions[0]/2) / tileSize),
    Math.round((viewportOffset[1] + canvasDimensions[1]/2) / tileSize),
  ];

}

/**
 * @param {number} x
 * @param {number} y
 */
function setTileCenter(x, y) {
  viewportOffset = [
    x * tileSize - Math.floor(canvasDimensions[0] / 2),
    y * tileSize - Math.floor(canvasDimensions[1] / 2),
  ];
  console.log(viewportOffset);
}

/**
 * @type {null|ReturnType<setTimeout>}
 */
let searchDelay = null;

/**
 * @param {Event} ev
 */
function searchChange(ev) {

  const newValue = /** @type {any} */ (ev.target).value;
  if (searchDelay) {
    clearTimeout(searchDelay);
  }
  searchDelay = setTimeout(async() => {
    const params = new URLSearchParams({
      q: newValue,
      limit: '1',
      format: 'json',
    });
    const resp = await fetch('https://nominatim.openstreetmap.org/search?' + params.toString());
    const body = await resp.json();
    if (body.length>0) {
      gotoGps(body[0].lat, body[0].lon);
    }
  },1000);

}

/**
 * If true we prevent zooming
 */
let zoomDelay = false;

/**
 * @param {WheelEvent} ev
 */
function wheel(ev) {

  const center = getTileCenter();
  if (ev.deltaY<0) {
    // Zoom in
    tileSize = Math.min(64,tileSize+1);
  } else if (ev.deltaY > 0) {
    tileSize = Math.max(4,tileSize-1);
  }
  updateViewPort();
  setTileCenter(...center);
  requestDraw();
}

function updateViewPort() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasDimensions = [window.innerWidth, window.innerHeight];
  tileDimensions = [
    Math.ceil(window.innerWidth/tileSize),
    Math.ceil(window.innerHeight/tileSize)
  ];
}
