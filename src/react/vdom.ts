import { ELEMENT, TEXT } from "./constants";
import { onlyOne, setProps } from "./utils";
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
  }
  return dom;
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
  createNativeDOMChildren(dom, element.props.children);
  // 3. 处理props
  setProps(dom, props)
  return dom;
}
/**
 * 处理子节点 将子节点创建真实dom
 * @param parent
 * @param children
 */
function createNativeDOMChildren(
  parent: HTMLElement,
  children?: IReactElement[]
) {
  // 打平多维的孩子节点
  children?.flat(Infinity).forEach((child) => {
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
}
