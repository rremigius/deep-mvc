export type SparseVector3 = {x?:number, y?:number, z?:number};

export default class Vector3 {
	x:number = 0;
	y:number = 0;
	z:number = 0;

	constructor(x:number, y:number, z:number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
