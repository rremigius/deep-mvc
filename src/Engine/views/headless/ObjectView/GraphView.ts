import ObjectView from "@/Engine/views/headless/ObjectView";
import IGraphView, {
	GraphConfig, GraphData,
	GraphSetup
} from "@/Engine/views/common/IObjectView/IGraphView";
import headlessContainer from "@/Engine/views/headless/dependencies";
import {injectable} from "@/Engine/views/dependencies";

injectable(headlessContainer, "IGraphView")
export default class GraphView extends ObjectView implements IGraphView {
	config(config: GraphConfig): void {
	}

	onFrame(): void {
	}

	setData(data: GraphData): void {
	}

	setup(setup: GraphSetup): void {
	}

}
