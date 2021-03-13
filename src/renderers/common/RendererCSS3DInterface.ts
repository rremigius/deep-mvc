import RendererInterface from "@/renderers/common/RendererInterface";

export default interface RendererCSS3DInterface<T> extends RendererInterface<T> {
	setMainRenderer(renderer:RendererInterface<T>):void;
}
