export const TEXT = Symbol.for("react.text"); // 文本
export const ELEMENT = Symbol.for("react.element"); // react 元素 原生标签
export const FUNCTION_COMPONENT = Symbol.for("react.functionComponent"); // react 函数式组件
export const CLASS_COMPONENT = Symbol.for("react.classComponent"); // react 元素 类组件

export const MOVE = "MOVE";
export const REMOVE = "REMOVE";
export const INSERT = "INSERT";

export const TAG_ROOT = Symbol.for("TAG_ROOT"); // react应用需要一个根Fiber
export const TAG_HOST = Symbol.for("TAG_HOST"); // 原生节点 span div

export const ELEMENT_TEXT = Symbol.for("ELEMENT_TEXT"); // 文本节点
export const TAG_TEXT = Symbol.for("TAG_TEXT"); // 文本节点 fiber tag
