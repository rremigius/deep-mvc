import RendererInterface from "@/renderers/common/RendererInterface";
import CameraRenderInterface from "@/renderers/common/ObjectRenderInterface/CameraRenderInterface";
import SceneRenderInterface from "@/renderers/common/ObjectRenderInterface/SceneRenderInterface";

export default class Renderer implements RendererInterface {
	width:number = 0;
	height:number = 0;

	getSize(): { width: number; height: number } {
		return {height: this.height, width: this.width};
	}

	render(scene: SceneRenderInterface, camera: CameraRenderInterface): void {
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
}
