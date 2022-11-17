import { Component } from "./Component";
import {
  CLASS_COMPONENT,
  ELEMENT,
  FUNCTION_COMPONENT,
  TEXT,
} from "./constants";
import { ReactElement } from "./vdom";
/**
 * react 中一个children的时候不是数组
 * $$typeof 是react标识的类型 type是实际的类型 比如是span div等
 * @param type
 * @param config
 * @param children
 */
function createElement(type, config: any = {}, ...children) {
  delete config.__source;
  delete config.__self;
  const { key, ref, ...props } = config;
  // react 的类型
  let $$typeof: Symbol | null = null;
  // 原生标签 button span div
  if (typeof type === "string") {
    $$typeof = ELEMENT;
  } else if (typeof type === "function" && type.isReactComponent) {
    // 类组件
    $$typeof = CLASS_COMPONENT;
  } else if (typeof type === "function") {
    // 函数式组件
    $$typeof = FUNCTION_COMPONENT;
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
  Component,
};

export { createElement, Component };
