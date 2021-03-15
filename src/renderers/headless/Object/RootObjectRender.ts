import ObjectRender from "@/renderers/headless/ObjectRender";
import {alphanumeric} from "mozel";
import {injectable} from "@/renderers/inversify";
import headlessContainer from "@/renderers/headless/inversify";
import {ObjectClickEventEmitter} from "@/renderers/common/ObjectRenderInterface/RootObjectRenderInterface";

@injectable(headlessContainer, "RootObjectRenderInterface")
export default class RootObjectRender extends ObjectRender implements RootObjectRender {
	gid: alphanumeric = 0;
	events = {
		click: new ObjectClickEventEmitter()
	}
}
