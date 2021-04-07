import IGraphView, {
	GraphConfig,
	GraphData,
	GraphSetup,
	IGraphViewSymbol
} from "@/Engine/views/common/IObjectView/IGraphView";
import ObjectView from "@/Engine/views/headless/ObjectView";

export default class GraphView extends ObjectView implements IGraphView {
	static ViewInterface = IGraphViewSymbol;

	config(config: GraphConfig): void {
	}

	onFrame(): void {
	}

	setData(data: GraphData): void {
	}

	setup(setup: GraphSetup): void {
	}

}
