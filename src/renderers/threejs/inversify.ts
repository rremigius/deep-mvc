import {Container, decorate, injectable} from "inversify";
import renderContainer from "@/renderers/common/inversify";
import {EventDispatcher, Object3D} from "three";

const threeContainer = new Container({autoBindInjectable: true});
threeContainer.parent = renderContainer;

export default threeContainer;
