import View from "@/View";
import ViewModel from "@/ViewModel";

export default class HtmlView extends View {
	static Model = ViewModel;
	model!:ViewModel;

	domElement!:HTMLElement;

	onInit() {
		super.onInit();
		this.domElement = this.createDOMElement();
		this.domElement.setAttribute("data-gid", this.gid.toString());
		this.domElement.className = this.static.name;
	}

	createDOMElement():HTMLElement {
		return document.createElement('div');
	}

	onViewAdd(view:HtmlView) {
		super.onViewAdd(view);
		this.domElement.append(view.domElement);
	}

	onViewRemove(view: HtmlView) {
		super.onViewRemove(view);
		if(this.domElement.contains(view.domElement)) {
			this.domElement.removeChild(view.domElement);
		}
	}
}
