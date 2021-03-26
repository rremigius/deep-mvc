import {Container} from "inversify";

const viewContainer = new Container({autoBindInjectable: true});
export default viewContainer;

export function createDependencyContainer(useDefaultParent = true) {
	const container = new Container({autoBindInjectable: true});
	if(useDefaultParent) {
		container.parent = viewContainer;
	}
	return container;
}
