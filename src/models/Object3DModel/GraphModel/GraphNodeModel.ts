import Model, {Alphanumeric, property} from "@common/classes/Model/Model";
import {alphanumeric} from "@common/classes/Model/Property";
import GenericModel from "@/models/GenericModel";
import {required} from "@common/utils";
import {uniqueId} from 'lodash';

export default class GraphNodeModel extends Model {
	static get type() { return 'GraphNode' };

	id:alphanumeric = super.id || uniqueId();

	@property(GenericModel)
	data?:GenericModel;

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
