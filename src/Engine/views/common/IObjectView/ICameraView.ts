import IViewRoot from "@/IViewRoot";

export default interface ICameraView extends IViewRoot {
	setAspectRatio(ratio:number):void;
}
export const ICameraViewSymbol = Symbol.for("ICameraView");
