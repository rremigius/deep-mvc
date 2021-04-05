import {Container} from "inversify";
import renderContainer from "@/Engine/views/common/dependencies";

const threeViewDependencies = new Container({autoBindInjectable: true});
threeViewDependencies.parent = renderContainer;

export default threeViewDependencies;
