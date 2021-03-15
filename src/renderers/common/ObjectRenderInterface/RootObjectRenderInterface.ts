import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";
import {alphanumeric} from "mozel";
import EventEmitter from "@/EventEmitter";

export class ObjectClickEvent {
	constructor(public intersects:object[]) {}
}
export class ObjectClickEventEmitter extends EventEmitter<ObjectClickEvent>{}

export default interface RootObjectRenderInterface extends ObjectRenderInterface {
	gid: alphanumeric;
	events: {
		click: ObjectClickEventEmitter;
	}
}
