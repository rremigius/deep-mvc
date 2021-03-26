import Model, {Alphanumeric, alphanumeric, property, GenericMozel, required} from "mozel";
import {uniqueId} from 'lodash';

export default class GraphNodeModel extends Model {
	static get type() { return 'GraphNode' };

	id:alphanumeric = super.id || uniqueId();

	@property(GenericMozel)
	data?:GenericMozel;

	@property(String)
	label?:string;

	@property(String)
	color?:string;

	@property(Number, {required, default: 10})
	size!:number;

	@property(Alphanumeric)
	group?:alphanumeric;

	constructor() {
		super();
		if(!this.id) this.id = uniqueId();
	}
}
