import XRRendererInterface from "@/classes/renderers/common/XRRendererInterface";

export default interface RendererCSS3DInterface<T> extends XRRendererInterface<T> {
	setMainRenderer(renderer:XRRendererInterface<T>):void;
}
