import IObjectView from "../IObjectView";

export default interface ICameraView extends IObjectView {
	setAspectRatio(ratio:number):void;
}
export const ICameraViewSymbol = Symbol.for("ICameraView");
