import IView from "@/IView";

export default interface ICameraView extends IView {
	setAspectRatio(ratio:number):void;
}
export const ICameraViewSymbol = Symbol.for("ICameraView");
