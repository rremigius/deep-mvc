import IRenderer from "@/Engine/views/common/IRenderer";
import ICameraView from "@/Engine/views/common/IObjectView/ICameraView";
import ISceneView from "@/Engine/views/common/ISceneView";

export default class Renderer implements IRenderer {
	width:number = 0;
	height:number = 0;
	element:HTMLElement;

	constructor() {
		this.element = new HTMLElement();
	}

	getSize(): { width: number; height: number } {
		return {height: this.height, width: this.width};
	}

	render(scene: ISceneView, camera: ICameraView): void {
	}

	setSize(width: number, height: number): void {
		this.width = width;
		this.height = height;
	}

	attachTo(element: HTMLElement): void {
	}

	destroy(): void {
	}

	detach(): void {
	}

	getDOMElement(): HTMLElement {
		return this.element;
	}
}
