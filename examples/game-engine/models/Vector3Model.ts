import Model, {property, required} from "mozel";

export default class Vector3Model extends Model {
	@property(Number, {required})
	x!:number;
	@property(Number, {required})
	y!:number;
	@property(Number, {required})
	z!:number;
}
