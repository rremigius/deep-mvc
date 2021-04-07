import {injectable} from "@/Engine/views/dependencies";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import headlessContainer from "@/Engine/views/headless/dependencies";
import IView, {IViewSymbol} from "@/IView";
import Mozel from "mozel";

@injectable(headlessContainer, IViewSymbol)
export default class View implements IView {
	model?:Mozel;
	position:Vector3;
	scale:Vector3;
	children:View[] = [];
	visible:boolean = true;
	name:string = "View";

	constructor() {
		this.position = new Vector3(0,0,0);
		this.scale = new Vector3(1,1,1);
	}

	add(view: View): this {
		this.children.push(view);
		return this;
	}

	getPosition(): Vector3 {
		return this.position;
	}

	getScale(): Vector3 {
		return this.scale;
	}

	isVisible(): boolean {
		return this.visible;
	}

	remove(view: View): this {
		return this;
	}

	setName(name: string): void {
		this.name = name;
	}

	setPosition(position: Vector3 | SparseVector3): void {
		this.position = Vector3.create(position);
	}

	setScale(scale: Vector3 | SparseVector3): void {
		this.scale = Vector3.create(scale);
	}

	setVisible(visible: boolean): void {
		this.visible = visible;
	}

}
