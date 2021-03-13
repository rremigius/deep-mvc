import {Container, injectable} from "inversify";
import {Class} from "validation-kit";

export function newableString(interfaceName:string) {
	return `Newable<${interfaceName}>`;
}

export function injectableObjectRender(container:Container, interfaceName:string) {
	return function(Target:Class) {
		injectable()(Target);
		container.bind(interfaceName).to(Target);
	};
}

export function injectableRenderClass(container:Container, interfaceSymbol:any) {
	return function(Target:Class) {
		injectable()(Target);
		container.bind(interfaceSymbol).to(Target);
	};
}

export function injectableRenderConstructor(container:Container, interfaceSymbol:any) {
	return function(Target:Class) {
		injectable()(Target);
		container.bind(newableString(interfaceSymbol)).toConstructor(Target);
	};
}
