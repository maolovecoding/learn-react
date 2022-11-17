import { Component } from "./Component";
import {
  CLASS_COMPONENT,
  ELEMENT,
  FUNCTION_COMPONENT,
  TEXT,
} from "./constants";
import { flatten, onlyOne, setProps } from "./utils";
/**
 * 创建一个react元素
 * @param $$typeof
 * @param type
 * @param key
 * @param ref
 * @param props
 * @returns
 */
export function ReactElement($$typeof, type, key, ref, props): IReactElement {
  const element = { $$typeof, type, key, ref, props };
  return element;
}
/**
 * dom diff
 * @param oldVdom
 * @param newVdom
 * @returns
 */
export function compareTwoElements(oldRenderElement, newRenderElement) {
  oldRenderElement = onlyOne(oldRenderElement);
  newRenderElement = onlyOne(newRenderElement);
  // 取出老的dom节点
  let currentDOM: HTMLElement | null = oldRenderElement.dom;
  // 比较后的渲染结果
  let currentRenderElement = oldRenderElement;
  if (newRenderElement == null) {
    // 新的渲染结果是空 直接干掉老的dom节点
    currentDOM?.parentNode?.removeChild(currentDOM);
    currentDOM = null;
    oldRenderElement.dom = null;
  } else if (oldRenderElement.type !== newRenderElement.type) {
    // 两次渲染的标签类型都不一样没办法复用dom元素 div -> span
    const newDOM = createDOM(newRenderElement);
    currentDOM?.parentNode?.replaceChild(newDOM, currentDOM);
    oldRenderElement.dom = newDOM;
  } else {
    // TODO  新老节点都存在且类型一致  进行dom diff 深度比较 属性 + 子节点
    const newDOM = createDOM(newRenderElement);
    currentDOM?.parentNode?.replaceChild(newDOM, currentDOM);
    currentRenderElement = newRenderElement;
    currentRenderElement.dom = newDOM;
  }
  return currentRenderElement;
}

/**
 * 把虚拟dom转为真实dom
 * @param element
 */
export function createDOM(element: IReactElement | IReactElement[]) {
  // TODO  为什么要这样做？
  element = onlyOne(element);
  const { $$typeof } = element;
  let dom: Node | null = null;
  // createDOM('123') 是一个原生文本节点
  if (!$$typeof) {
    dom = document.createTextNode(element as unknown as string);
  } else if ($$typeof === TEXT) {
    // react 的文本节点
    dom = document.createTextNode(element.content!);
  } else if ($$typeof === ELEMENT) {
    // react 元素 也就是原生的标签
    dom = createNativeDOM(element);
  } else if ($$typeof === CLASS_COMPONENT) {
    // 渲染类组件
    dom = createClassComponentDOM(element);
  } else if ($$typeof === FUNCTION_COMPONENT) {
    // 渲染函数组件
    dom = createFunctionComponentDOM(element);
  }
  element.dom = dom; // 只要是react元素 都指向创建出来的真实dom元素
  return dom;
}
/**
 *
 * @param element 创建类组件对应的dom元素
 */
function createClassComponentDOM(element: IReactElement) {
  // type就是这个类了
  const { type: Constructor, props } = element;
  // 创建组件实例
  const componentInstance: Component = new Constructor(props);
  // 类组件的虚拟dom（也是react元素） 记录当前渲染的组件实例对象
  element.componentInstance = componentInstance;
  // 拿到渲染的react元素
  const renderElement = componentInstance.render();
  // 组件实例记录渲染的 虚拟dom（react元素）
  componentInstance.renderElement = renderElement;
  // 真实dom
  const newDom = createDOM(renderElement);
  // 虚拟dom（react元素） 记录对应的真实dom
  renderElement.dom = newDom;
  return newDom;
}
/**
 *
 * @param element 创建函数组件对应的dom元素
 */
function createFunctionComponentDOM(element: IReactElement) {
  // type 就是一个函数
  const { type, props } = element;
  // 要渲染的react 元素
  const renderElement = type(props);
  element.renderElement = renderElement;
  const newDom = createDOM(renderElement);
  // 虚拟dom（react元素） 记录对应的真实dom
  renderElement.dom = newDom;
  return newDom;
}

/**
 * 创建原生dom元素
 * @param element
 * @returns
 */
function createNativeDOM(element: IReactElement) {
  const { type, props } = element;
  // 1. 创建真实dom元素
  const dom = document.createElement(type);
  // 2. 处理子节点
  createDOMChildren(dom, element.props.children);
  // 3. 处理props
  setProps(dom, props);
  return dom;
}
/**
 * 处理子节点 将子节点创建真实dom
 * @param parent
 * @param children
 */
function createDOMChildren(parent: HTMLElement, children?: IReactElement[]) {
  // 打平多维的孩子节点
  children &&
    flatten(children).forEach((child, index) => {
      // child 是react元素 也就是虚拟dom
      // TODO  _mountIndex 指向当前子节点再父节点中的索引
      child._mountIndex = index;
      const childDOM = createDOM(child)!;
      parent.appendChild(childDOM);
    });
}

interface IReactElement {
  $$typeof;
  type;
  key;
  ref;
  props: {
    [key: keyof any]: any;
    children: IReactElement[];
  };
  content?: string; // react 文本节点
  componentInstance?: Component; // 类组件的实例
  renderElement?: any; // 函数式组件的渲染结果（虚拟dom react元素）
  dom?: Node | null; // 只要是react元素 都指向创建出来的真实dom元素
}
