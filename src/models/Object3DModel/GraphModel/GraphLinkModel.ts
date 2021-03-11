import Model, {Alphanumeric, property} from "@common/classes/Model/Model";
import {alphanumeric} from "@common/classes/Model/Property";
import GenericModel from "@/models/GenericModel";
import {reference, required} from "@common/utils";
import GraphNodeModel from "@/models/Object3DModel/GraphModel/GraphNodeModel";
import {uniqueId} from 'lodash';

export default class GraphLinkModel extends Model {
	static get type() { return 'GraphLink' };

	id:alphanumeric = super.id || uniqueId();

	@property(GenericModel)
	data?:GenericModel;

	@property(GraphNodeModel, {reference})
	from?:GraphNodeModel;

	@property(GraphNodeModel, {reference})
	to?:GraphNodeModel;

	@property(String)
	label?:string;

	@property(String)
	color?:string;

	@property(Alphanumeric)
	group?:alphanumeric;

	@property(Number, {required, default: 3})
	size!:number;
}
