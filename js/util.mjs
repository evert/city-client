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


/**
 * Creates an array of length num, and fills it with the result
 * of the callback.
 *
 * @param {number} num
 * @param {(idx: number) => any} valueCb
 * @returns {any[]}
 */
export function range(num, valueCb) {

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
