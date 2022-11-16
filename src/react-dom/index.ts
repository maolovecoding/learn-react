import {createDOM} from '../react/vdom'
/**
 * 渲染dom
 * @param element 
 * @param container 
 */
function render(element, container: HTMLElement | null) {
  // 1. 把 vdom转换为真实dom
  const dom = createDOM(element)!
  // 2. 把真实dom挂载到container上
  container?.appendChild(dom)
}

export default {
  render,
};
