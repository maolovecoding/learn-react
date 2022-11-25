import { patchProps } from "../react/utils";
import {
  ELEMENT_TEXT,
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
} from "./../react/constants";
/**
 * 从根节点开始渲染和调度
 * 两个阶段：
 * 1. diff 对比新旧的虚拟dom 进行增量 更新或创建 render阶段
 * 这个阶段可能比较花时间，我们可以对任务进行拆分，拆分的维度 虚拟dom划分，此阶段可以划分
 * 此阶段是为了收集 effect list 知道那些节点更新，删除，新增等
 * 会生成fiber树
 * 2. commit 阶段  进行dom更新创建阶段，此阶段不能暂停，要一气呵成
 * @param fiber
 */
function scheduleRoot(rootFiber: {
  tag: any;
  stateNode: HTMLElement;
  props: { children: any[] };
}) {
  workInProgressRoot = rootFiber;
  nextUnitOfWork = workInProgressRoot;
}
/**
 * 工作循环
 */
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false; // 是否要让出时间片
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork) {
    console.log("render 结束");
  }
  // /不管有没有任务 都请求下次调度
  requestIdleCallback(workLoop, { timeout: 500 });
}
function performUnitOfWork(currentFiber) {
  // 开始工作
  beginWork(currentFiber);
  // 有孩子 返回孩子作为下一个任务的工作单元
  if (currentFiber.child) {
    return currentFiber.child;
  }
  // 没有孩子 则进入完成工作单元
  while (currentFiber) {
    // 没有孩子 让节点自己完成
    completeUnitOfWork(currentFiber);
    // 有弟弟  返回弟弟
    if (currentFiber.sibling) return currentFiber.sibling;
    // 找父亲
    currentFiber = currentFiber.return;
  }
}
function completeUnitOfWork(currentFiber) {}
/**
 * 1. 创建真实dom
 * 2. 创建子fiber  updateHostRoot
 * @param currentFiber
 */
function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    // 根fiber
    updateHostRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    // 文本节点的fiber
    updateHostTest(currentFiber);
  }
}
function updateHostTest(currentFiber) {
  // fiber还没有创建dom
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}
function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  }
  if (currentFiber.tag === TAG_HOST) {
    const stateNode = document.createElement(currentFiber.type);
    // TODO 处理dom属性
    updateDOM(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}
function updateDOM(dom, oldProps, newProps) {
  patchProps(dom, oldProps, newProps)
}
function updateHostRoot(rootFiber) {
  // 先处理自己 如果是一个原生节点 创建真实dom 2. 创建子fiber
  const newChildren = rootFiber.props.children;
  // 调和阶段
  reconcileChildren(rootFiber, newChildren);
}
function reconcileChildren(currentFiber, children) {
  let newChildIndex = 0; // 新子节点的索引
  let previousSibling = null as any; // 上一个新的子fiber
  while (newChildIndex < children.length) {
    // 创建子fiber
    // 取出虚拟dom节点
    const newChild = children[newChildIndex];
    let tag;
    if (newChild.type === ELEMENT_TEXT) {
      // 文本
      tag = TAG_TEXT;
    } else if (typeof newChild.type === "string") {
      // 原生dom节点
      tag = TAG_HOST;
    }
    const newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT, // 副作用标识
      nextEffect: null, // effect list  也是单链表
    };
    if (newFiber) {
      // 大孩子
      if (newChildIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        // 孩子串起来 老大指向老二，老二指向老三
        previousSibling!.sibling = newFiber;
      }
      previousSibling = newFiber;
    }
    newChildIndex++;
  }
}
// 下一个工作单元
let nextUnitOfWork: any = null;
// 整个react应用的根
let workInProgressRoot = null as any;
requestIdleCallback(workLoop, { timeout: 500 });
export { scheduleRoot };

const PLACEMENT = "PLACEMENT"; // 插入
const UPDATE = "UPDATE"; // 更新
const DELETE = "DELETE"; // 删除
