import View from "@/Engine/views/headless/View";
import {alphanumeric} from "mozel";
import IViewRoot, {IViewRootSymbol, ViewClickEventEmitter} from "@/IViewRoot";

export default class ViewRoot extends View implements IViewRoot {
	static ViewInterface = IViewRootSymbol;

	gid: alphanumeric = 0;
	events = {
		click: new ViewClickEventEmitter()
	}
}
