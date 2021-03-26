export type SparseVector3 = {x?:number, y?:number, z?:number};

export default class Vector3 {
	x:number = 0;
	y:number = 0;
	z:number = 0;

	static create(vector3:SparseVector3) {
		return new Vector3(
			vector3.x === undefined ? 0 : vector3.x,
			vector3.y === undefined ? 0 : vector3.y,
			vector3.z === undefined ? 0 : vector3.z
		)
	}

	constructor(x:number, y:number, z:number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
