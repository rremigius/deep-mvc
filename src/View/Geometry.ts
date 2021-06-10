/**
 * Returns a width and height with the same aspect ratio as the sourceWidth and sourceHeight, fitting exactly within
 * the targetWidth and targetHeight.
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @return {{width: number, height: number}}
 */
export function fitInSide(sourceWidth:number, sourceHeight:number, targetWidth:number, targetHeight:number) {
	if(sourceHeight > sourceWidth) {
		return {width: sourceWidth / sourceHeight * targetWidth, height: targetHeight}
	}
	return {width: targetWidth, height: sourceHeight / sourceWidth * targetHeight}
}
