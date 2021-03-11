import Model, {property} from 'mozel';

export default class FileModel extends Model {
	static get type() { return 'File' };

	@property(String, {required: true})
	name!:string;

	@property(Number, {required: true})
	size!:number;

	@property(String, {required: true})
	url!:string;
}
