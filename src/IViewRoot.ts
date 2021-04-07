import IView from "@/IView";
import {alphanumeric} from "mozel";
import EventEmitter from "@/EventEmitter";

export class ViewClickEvent {
	constructor(public intersects:object[]) {}
}
export class ViewClickEventEmitter extends EventEmitter<ViewClickEvent>{}

export default interface IViewRoot extends IView {
	gid: alphanumeric;
	events: {
		click: ViewClickEventEmitter;
	}
}

export const IViewRootSymbol = Symbol.for("IViewRoot");
