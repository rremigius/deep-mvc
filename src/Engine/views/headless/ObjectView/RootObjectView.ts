import ObjectView from "@/Engine/views/headless/ObjectView";
import {alphanumeric} from "mozel";
import {injectable} from "@/Engine/views/dependencies";
import headlessContainer from "@/Engine/views/headless/dependencies";
import {ObjectClickEventEmitter} from "@/Engine/views/common/IObjectView/IRootObjectView";

@injectable(headlessContainer, "IRootObjectView")
export default class RootObjectView extends ObjectView implements RootObjectView {
	gid: alphanumeric = 0;
	events = {
		click: new ObjectClickEventEmitter()
	}
}
