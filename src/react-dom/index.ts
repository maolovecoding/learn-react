import { updateQueue } from "../react/Updater";
import { createDOM } from "../react/vdom";
/**
 * 渲染dom
 * @param element
 * @param container
 */
function render(element, container: HTMLElement | null) {
  // 1. 把 vdom转换为真实dom
  const dom = createDOM(element)!;
  // 2. 把真实dom挂载到container上
  container?.appendChild(dom);
}
/**
 * 批量更新模式
 */
function unstable_batchedUpdates(fn: Function) {
  try {
    updateQueue.isPending = true;
    fn();
  } catch (error) {
  } finally {
    updateQueue.isPending = false;
    updateQueue.batchUpdate();
  }
}

export default {
  render,
  unstable_batchedUpdates,
};
export { unstable_batchedUpdates };
