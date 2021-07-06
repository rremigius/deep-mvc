/**
 * Returns a width and height with the same aspect ratio as the sourceWidth and sourceHeight, fitting exactly within
 * the targetWidth and targetHeight.
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @return {{width: number, height: number}}
 */
export declare function fitInSide(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): {
    width: number;
    height: number;
};
