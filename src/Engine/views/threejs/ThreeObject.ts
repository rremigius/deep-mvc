import ThreeView from "@/Engine/views/threejs/ThreeView";
import ObjectModel from "@/Engine/models/ObjectModel";
import Component, {components} from "@/Component";
import {schema} from "mozel";
import ComponentList from "@/Component/ComponentList";

export default class ThreeObject extends ThreeView {
	static Model = ObjectModel;
	model!:ObjectModel;

	@components(schema(ObjectModel).behaviours, Component)
	behaviours!:ComponentList<Component>;
}
