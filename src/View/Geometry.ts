export function fitInSide(sourceWidth:number, sourceHeight:number, targetWidth:number, targetHeight:number) {
	if(sourceHeight > sourceWidth) {
		return {width: sourceWidth / sourceHeight * targetWidth, height: targetHeight}
	}
	return {width: targetWidth, height: sourceHeight / sourceWidth * targetHeight}
}
