import {Container} from "inversify";
import renderContainer from "@/renderers/common/inversify";

const threeContainer = new Container({autoBindInjectable: true});
threeContainer.parent = renderContainer;

export default threeContainer;
