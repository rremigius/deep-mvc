import {Container} from "inversify";
import renderContainer from "@/Engine/views/common/dependencies";

const threeContainer = new Container({autoBindInjectable: true});
threeContainer.parent = renderContainer;

export default threeContainer;
