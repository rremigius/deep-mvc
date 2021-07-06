"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitInSide = void 0;
/**
 * Returns a width and height with the same aspect ratio as the sourceWidth and sourceHeight, fitting exactly within
 * the targetWidth and targetHeight.
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @return {{width: number, height: number}}
 */
function fitInSide(sourceWidth, sourceHeight, targetWidth, targetHeight) {
    if (sourceHeight > sourceWidth) {
        return { width: sourceWidth / sourceHeight * targetWidth, height: targetHeight };
    }
    return { width: targetWidth, height: sourceHeight / sourceWidth * targetHeight };
}
exports.fitInSide = fitInSide;
//# sourceMappingURL=Geometry.js.map