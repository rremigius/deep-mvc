declare module 'three-collada-loader-2' {
	import {Object3D} from "three";
	export type ColladaReponse = { scene:Object3D	};
	export default class ColladaLoader {
		load( url:string, onLoad:(collada:ColladaReponse)=>void, onProgress:Function, onError:Function ):void;
	}
}
