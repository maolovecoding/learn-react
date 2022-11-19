import { addEvent } from "./event";
/**
 * 是数组 就取数组的第一个元素 否则就返回对象自身
 * @param obj
 */
export function onlyOne<T>(obj: T | T[]) {
  return Array.isArray(obj) ? obj[0] : obj;
}

/**
 * 给真实dom节点 设置属性
 */
export function setProps(dom: HTMLElement, props) {
  for (let key in props) {
    if (key !== "children") {
      const val = props[key];
      setProp(dom, key, val);
    }
  }
}
/**
 * 打补丁 props
 * @param dom ;
 * @param oldProps
 * @param newProps
 */
export function patchProps(dom: HTMLElement, oldProps, newProps) {
  // 1. 新的有 老的没有 增加
  // 2. 老的有 新的没有 删除
  // 3. 新老都有的属性 更新为新的
  for (const key in oldProps) {
    if (key !== "children") {
      if (!newProps.hasOwnProperty(key)) {
        dom.removeAttribute(key);
      }
    }
  }
  for (const key in newProps) {
    if (key !== "children") {
      setProp(dom, key, newProps[key]);
    }
  }
}

function setProp(dom: HTMLElement, key, val) {
  if (/^on/.test(key)) {
    // TODO 事件监听函数   合成事件
    // dom[key.toLowerCase()] = val;
    addEvent(dom, key, val);
  } else if (key === "style") {
    for (let styleName in val) {
      dom.style[styleName] = val[styleName];
    }
  } else if (key === "className") {
    dom.className = val;
  } else {
    dom.setAttribute(key, val);
  }
}
/**
 * 拍平数组
 * @param arr
 * @returns
 */
export function flatten(arr: any[]) {
  const res: any[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) res.push(...flatten(item));
    else res.push(item);
  }
  return res;
}

export function isFunction(obj: unknown): obj is Function {
  return typeof obj === "function";
}
