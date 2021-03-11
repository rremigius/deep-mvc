import {alphanumeric} from "@common/classes/Model/Property";
import XRObjectRenderInterface from "@/classes/renderers/common/XRObjectRenderInterface";

export interface ClickEventInterface {
	meshes: string[];
}

export default interface ControllerRootRenderInterface<T> extends XRObjectRenderInterface<T> {
	gid: alphanumeric;
	onClick: (event: ClickEventInterface) => void;
}
