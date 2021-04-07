import View from "@/Engine/views/headless/View";
import {alphanumeric} from "mozel";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";
import {IViewRootSymbol, ViewClickEventEmitter} from "@/IViewRoot";

@injectable(headlessContainer, IViewRootSymbol)
export default class ViewRoot extends View implements ViewRoot {
	gid: alphanumeric = 0;
	events = {
		click: new ViewClickEventEmitter()
	}
}
