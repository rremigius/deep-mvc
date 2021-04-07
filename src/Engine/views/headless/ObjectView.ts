import IObjectView, {IObjectViewSymbol} from "../common/IObjectView";
import ViewRoot from "@/Engine/views/headless/ViewRoot";

export default class ObjectView extends ViewRoot implements IObjectView {
	static ViewInterface = IObjectViewSymbol;
}
