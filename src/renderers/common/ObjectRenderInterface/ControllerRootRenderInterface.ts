import {alphanumeric} from "@common/classes/Model/Property";
import ObjectRenderInterface from "@/renderers/common/ObjectRenderInterface";

export interface ClickEventInterface {
	meshes: string[];
}

export default interface ControllerRootRenderInterface<T> extends ObjectRenderInterface<T> {
	gid: alphanumeric;
	onClick: (event: ClickEventInterface) => void;
}
