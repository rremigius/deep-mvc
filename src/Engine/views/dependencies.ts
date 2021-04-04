import {Container, injectable as invInjectable} from "inversify";
import {Class} from "validation-kit";

export function injectable(container:Container, interfaceSymbol:symbol) {
	return function(Target:Class) {
		invInjectable()(Target);
		container.bind(interfaceSymbol).to(Target);
	};
}
