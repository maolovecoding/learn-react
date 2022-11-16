import { ELEMENT, TEXT } from "./constants";
import { ReactElement } from "./vdom";
/**
 * react 中一个children的时候不是数组
 * $$typeof 是react标识的类型 type是实际的类型 比如是span div等
 * @param type
 * @param config
 * @param children
 */
function createElement(type, config: any = {}, ...children) {
  delete config._source;
  delete config._self;
  const { key, ref, ...props } = config;
  // react 的类型
  let $$typeof: Symbol | null = null;
  // 原生标签 button span div
  if (typeof type === "string") {
    $$typeof = ELEMENT;
  }
  props.children = children.map((item) => {
    // 子节点是react 元素类型 直接返回
    if (typeof item === "object") {
      return item;
    } else {
      // 是文本字符串 包装成 react 文本元素
      return { $$typeof: TEXT, type: TEXT, content: item };
    }
  });
  return ReactElement($$typeof, type, key, ref, props);
}

export default {
  createElement,
};

export { createElement };
