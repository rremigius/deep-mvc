import {BoxGeometry, Mesh, MeshBasicMaterial} from "three";

export function createDebugCube() {
	const geometry = new BoxGeometry( 1, 1, 1 );
	const material = new MeshBasicMaterial( { color: "#433F81" } );
	return new Mesh( geometry, material );
}
