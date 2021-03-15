import {Container} from "inversify";
import renderContainer from "@/renderers/common/inversify";

const headlessContainer = new Container({autoBindInjectable: true});
headlessContainer.parent = renderContainer;

export default headlessContainer;
