import ObjectRender from "@/renderers/headless/ObjectRender";
import GraphRenderInterface, {
	GraphConfig, GraphData,
	GraphSetup
} from "@/renderers/common/ObjectRenderInterface/GraphRenderInterface";
import headlessContainer from "@/renderers/headless/inversify";
import {injectable} from "@/renderers/inversify";

injectable(headlessContainer, "GraphRenderInterface")
export default class GraphRender extends ObjectRender implements GraphRenderInterface {
	config(config: GraphConfig): void {
	}

	onFrame(): void {
	}

	setData(data: GraphData): void {
	}

	setup(setup: GraphSetup): void {
	}

}
