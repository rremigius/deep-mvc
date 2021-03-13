declare module 'three-css3drenderer' {
	import {Object3D} from "three";

	export class CSS3DObject extends Object3D{
		[key:string]:any

		constructor(element:HTMLElement);
	}
	export class CSS3DSprite {
		[key:string]:any
	}
	export class CSS3DRenderer {
		[key:string]:any
		domElement:HTMLElement;
	}
}
