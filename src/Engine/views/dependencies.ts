import {Container, injectable as invInjectable} from "inversify";
import {Class} from "validation-kit";

export function injectable(container:Container, interfaceName:string) {
	return function(Target:Class) {
		invInjectable()(Target);
		container.bind(interfaceName).to(Target);
	};
}
