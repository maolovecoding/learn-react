import { TAG_ROOT } from "../react/constants";
import { scheduleRoot } from "./schedule";

function render(element, container: HTMLElement) {
  // 根fiber
  const rootFiber = {
    tag: TAG_ROOT, // 每个fiber会有一个tag标识此元素的类型
    stateNode: container, // 一般情况下 如果这个元素是一个原生节点 指向真实dom
    props: {
      children: [element], // 这个fiber的属性对象 children 里面放的是要渲染react的元素
    },
  };
  scheduleRoot(rootFiber);
}
export default {
  render,
};
