// @ts-check
const chunkSize = 1000;


export class MapData { 

  constructor(onNewDataCb) {
    this.onNewDataCb = onNewDataCb;
    this.chunks = new Map();
  }
  
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  get(x, y) {

    // Get chunk.
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);

    const chunk = this.getChunk(chunkX, chunkY);
    if (!chunk || chunk instanceof Promise) return 52;

    const offsetX = mod(y, chunkSize);
    const offsetY = mod(x, chunkSize);
    return chunk[offsetY][offsetX];

  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {number[][]|false}
   */
  getChunk(x,y) {

    if (this.chunks.has(x+','+y)) {
      return this.chunks.get(x+','+y);
    }
    this.chunks.set(x+','+y, this.loadChunk(x,y));
    return false;

  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns Promise<void>
   */
  async loadChunk(x, y) {

    const params = new URLSearchParams({
      x: (x * chunkSize).toString(),
      y: (y * chunkSize).toString(),
      width: chunkSize.toString(),
      height: chunkSize.toString(),
    });
    const result = await fetch(`/map?${params.toString()}`);
    const body = await result.json();

    this.chunks.set(x+','+y, body.tiles)
    console.log('got chunk');
    this.onNewDataCb();

  }

}

function mod(n, m) {
  return ((n % m) + m) % m;
}
