import {injectable} from "@/Engine/views/dependencies";
import IView from "@/Engine/views/common/IObjectView";
import Vector3, {SparseVector3} from "@/Engine/views/common/Vector3";
import headlessContainer from "@/Engine/views/headless/dependencies";

@injectable(headlessContainer, "IObjectView")
export default class ObjectView implements IView {
	position:Vector3;
	scale:Vector3;
	children:ObjectView[] = [];
	visible:boolean = true;
	name:string = "Object3D";

	constructor() {
		this.position = new Vector3(0,0,0);
		this.scale = new Vector3(1,1,1);
	}

	add(object: ObjectView): this {
		this.children.push(object);
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

	remove(object: ObjectView): this {
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
