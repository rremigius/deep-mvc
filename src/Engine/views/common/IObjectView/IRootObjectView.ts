import IView from "@/Engine/views/common/IObjectView";
import {alphanumeric} from "mozel";
import EventEmitter from "@/EventEmitter";

export class ObjectClickEvent {
	constructor(public intersects:object[]) {}
}
export class ObjectClickEventEmitter extends EventEmitter<ObjectClickEvent>{}

export default interface IRootObjectView extends IView {
	gid: alphanumeric;
	events: {
		click: ObjectClickEventEmitter;
	}
}
