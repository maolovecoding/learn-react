import { Component } from "./Component";
import {
  CLASS_COMPONENT,
  ELEMENT,
  FUNCTION_COMPONENT,
  INSERT,
  MOVE,
  REMOVE,
  TEXT,
} from "./constants";
import { flatten, onlyOne, setProps, patchProps } from "./utils";
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
    // TODO 卸载类组件
    if (oldRenderElement.$$typeof === CLASS_COMPONENT) {
      oldRenderElement.componentInstance.componentWillUnmount?.();
    }
    // 新的渲染结果是空 直接干掉老的dom节点
    currentDOM?.parentNode?.removeChild(currentDOM);
    currentDOM = null;
    oldRenderElement.dom = null;
  } else if (oldRenderElement.type !== newRenderElement.type) {
    // TODO 卸载类组件
    if (oldRenderElement.$$typeof === CLASS_COMPONENT) {
      oldRenderElement.componentInstance.componentWillUnmount?.();
    }
    // 两次渲染的标签类型都不一样没办法复用dom元素 div -> span
    const newDOM = createDOM(newRenderElement);
    currentDOM?.parentNode?.replaceChild(newDOM, currentDOM);
    newRenderElement.dom = newDOM;
    currentRenderElement = newRenderElement;
  } else {
    // TODO  新老节点都存在且类型一致  进行dom diff 深度比较 属性 + 子节点
    updateElement(oldRenderElement, newRenderElement);
  }
  return currentRenderElement;
}
/**
 * dom diff 比较更新
 * @param oldElement react元素 老的
 * @param newElement
 */
function updateElement(oldElement, newElement) {
  // 复用dom
  const currentDOM: HTMLElement = (newElement.dom = oldElement.dom);
  // 文本节点
  if (oldElement.$$typeof === TEXT && newElement.$$typeof === TEXT) {
    // 文本内容不一致更新
    if (oldElement.content !== newElement.content)
      currentDOM.textContent = newElement.content;
  } else if (oldElement.$$typeof === ELEMENT) {
    // 元素类型  span div
    // 更新dom属性 props
    updateDOMProperties(currentDOM, oldElement.props, newElement.props);
    // TODO 更新子节点
    updateChildrenElements(
      currentDOM,
      oldElement.props.children,
      newElement.props.children
    );
    // 更新 react组件实例的props
    oldElement.props = newElement.props;
  } else if (oldElement.$$typeof === FUNCTION_COMPONENT) {
    // 函数式组件的更新
    updateFunctionComponent(oldElement, newElement);
  } else if (oldElement.$$typeof === CLASS_COMPONENT) {
    // 更新类组件
    updateClassComponent(oldElement, newElement);
  }
}
/**
 * 更新节点的深度
 */
let updateDepth = 0;
/**
 * 补丁包 记录那些节点需要删除 那些节点需要添加
 */
const diffQueue: any[] = [];
/**
 * 更新孩子节点
 * @param oldChildren
 * @param newChildren
 */
function updateChildrenElements(dom: HTMLElement, oldChildren, newChildren) {
  updateDepth++;
  // TODO diff 只是更新节点的属性和文本 不会处理节点的新增和删除
  diff(dom, oldChildren, newChildren, diffQueue);
  updateDepth--;
  if (updateDepth === 0) {
    // 整个更新结束 diff完成 回到最上层了
    // TODO 把收集到的差异 补丁 传给patch 进行更新 对节点的新增和删除
    patch(diffQueue);
    diffQueue.length = 0;
  }
}
/**
 * 打补丁 删除节点 移动节点 新增节点
 * @param diffQueue
 */
function patch(diffQueue) {
  const deleteMap = {};
  const deleteChildren: any[] = [];
  for (let i = 0; i < diffQueue.length; i++) {
    const difference = diffQueue[i];
    if (difference.type === MOVE || difference.type === REMOVE) {
      const fromIndex = difference.fromIndex;
      // 拿到老的子节点
      const oldChildDOM = difference.parentNode.children[fromIndex];
      deleteMap[fromIndex] = oldChildDOM;
      deleteChildren.push(oldChildDOM);
    }
  }
  // 将移动的和需要删除的都从父节点中移除掉先
  deleteChildren.forEach((childDOM) => {
    childDOM.parentNode.removeChild(childDOM);
  });
  for (let i = 0; i < diffQueue.length; i++) {
    const difference = diffQueue[i];
    switch (difference.type) {
      case INSERT:
        insertChildAt(
          difference.parentNode,
          difference.dom,
          difference.toIndex
        );
        break;
      case MOVE:
        insertChildAt(
          difference.parentNode,
          deleteMap[difference.fromIndex],
          difference.toIndex
        );
        break;
    }
  }
}
/**
 * 插入dom节点
 * @param parentNode
 * @param child
 * @param index
 */
function insertChildAt(
  parentNode: HTMLElement,
  child: HTMLElement,
  index: number
) {
  // 先取出这个索引对应的节点
  const oldChild = parentNode.children[index];
  oldChild
    ? parentNode.insertBefore(child, oldChild)
    : parentNode.appendChild(child);
}
/**
 * 新老孩子节点的dom diff
 * @param parentNode
 * @param oldChildren
 * @param newChildren
 */
function diff(parentNode: HTMLElement, oldChildren, newChildren, diffQueue) {
  const oldChildrenElementsMap = getChildrenElementsMap(oldChildren);
  const newChildrenElementsMap = getNewChildrenElementsMap(
    oldChildrenElementsMap,
    newChildren
  );
  // 不需要移动节点的下标
  let lastIndex = 0;
  for (let i = 0; i < newChildren.length; i++) {
    const newChildElement = newChildren[i];
    if (newChildElement) {
      const newKey = newChildElement.key || i.toString();
      const oldChildElement = oldChildrenElementsMap[newKey];
      if (newChildElement === oldChildElement) {
        if (oldChildElement._mountIndex < lastIndex) {
          // 需要移动
          diffQueue.push({
            parentNode, // 我要移除那个父节点下的元素
            type: MOVE,
            fromIndex: oldChildElement._mountIndex,
            toIndex: i,
          });
        }
        // 该节点复用了 更新lastIndex
        lastIndex = Math.max(oldChildElement._mountIndex, lastIndex);
      } else {
        // 没有复用节点 插入 需要创建新的dom节点了
        diffQueue.push({
          parentNode,
          type: INSERT,
          toIndex: i,
          dom: createDOM(newChildElement),
        });
      }
      // 更新当前最新子元素在父元素children中的挂载索引
      newChildElement._mountIndex = i;
    } else {
      // 节点不存在
      const newKey = i.toString();
      debugger;
      // TODO  组件卸载
      oldChildrenElementsMap[
        newKey
      ]?.componentInstance.componentWillUnmount?.();
    }
  }
  for (const oldKey in oldChildrenElementsMap) {
    if (!newChildrenElementsMap.hasOwnProperty(oldKey)) {
      diffQueue.push({
        parentNode,
        type: REMOVE,
        fromIndex: oldChildrenElementsMap[oldKey]._mountIndex,
      });
    }
  }
}

/**
 * 根据老的孩子数组 生成对应的map
 * @param oldChildren
 * @returns
 */
function getChildrenElementsMap(oldChildren) {
  const oldChildrenElementsMap = {};
  for (let i = 0; i < oldChildren.length; i++) {
    const oldKey = oldChildren[i].key || i.toString();
    oldChildrenElementsMap[oldKey] = oldChildren[i];
  }
  return oldChildrenElementsMap;
}
function getNewChildrenElementsMap(oldChildrenElementsMap, newChildren) {
  const newChildrenElementsMap = {};
  for (let i = 0; i < newChildren.length; i++) {
    const newChildElement = newChildren[i];
    if (newChildElement) {
      const newKey = newChildElement.key || i.toString();
      // 找到老的节点
      const oldChildElement = oldChildrenElementsMap[newKey];
      // 复用节点 key & type
      if (canDeepCompare(oldChildElement, newChildElement)) {
        // 复用节点 更新属性 递归更新该节点的子节点
        updateElement(oldChildElement, newChildElement);
        // 直接复用老节点了
        newChildren[i] = oldChildElement;
        // 从老的map中删除该节点
        // delete oldChildrenElementsMap[newKey];
      }
      // 当前最新的节点（可能是复用的老节点了）
      newChildrenElementsMap[newKey] = newChildren[i];
    }
  }
  return newChildrenElementsMap;
}
function canDeepCompare(oldChildElement, newChildElement) {
  if (!!oldChildElement && !!newChildElement) {
    return oldChildElement.type === newChildElement.type;
  }
  return false;
}
/**
 * 更新函数式组件
 * @param oldElement
 * @param newElement
 */
function updateFunctionComponent(oldElement, newElement) {
  // 取出上次渲染的虚拟dom
  const oldRenderElement = oldElement.renderElement;
  const { type: FunctionComponent, props } = newElement;
  const newRenderElement = FunctionComponent(props);
  // dom diff
  const currentRenderElement = compareTwoElements(
    oldRenderElement,
    newRenderElement
  );
  // 将渲染的虚拟dom重新挂载到函数式组件的虚拟dom上
  newElement.renderElement = currentRenderElement;
  return currentRenderElement;
}
/**
 * 更新类组件
 * @param oldElement
 * @param newElement
 */
function updateClassComponent(oldElement, newElement) {
  debugger;
  const { componentInstance } = oldElement;
  newElement.componentInstance = componentInstance;
  const updater = componentInstance.$updater;
  const nextProps = newElement.props; // 新的props
  // TODO 更新 context
  if (oldElement.type.contextType) {
    componentInstance.context = oldElement.type.contextType.Provider.value;
  }
  // TODO 组件将要接收新的属性对象
  componentInstance.componentWillReceiveProps?.(nextProps);
  if (newElement.type.getDerivedStateFromProps) {
    const newState = newElement.type.getDerivedStateFromProps(
      nextProps,
      componentInstance.state
    );
    if (newState) {
      componentInstance.state = { ...componentInstance.state, ...newState };
    }
  }
  // 触发 更新组件
  updater.emitUpdate(nextProps);
}
/**
 * 更新dom的属性
 * @param dom
 * @param oldProps
 * @param newProps
 */
function updateDOMProperties(dom, oldProps, newProps) {
  patchProps(dom, oldProps, newProps);
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
  const { type: Constructor, props, ref } = element;
  // 创建组件实例
  const componentInstance: Component = new Constructor(props);
  // TODO  处理contentType
  if (Constructor.contextType) {
    componentInstance.context = Constructor.contextType.Provider.value;
  }
  // TODO 处理ref
  if (ref) {
    ref.current = componentInstance;
  }
  // TODO 组件将要挂载
  componentInstance.componentWillMount?.();
  if (Constructor.getDerivedStateFromProps) {
    const newState = Constructor.getDerivedStateFromProps(
      props,
      componentInstance.state
    );
    if (newState) {
      componentInstance.state = { ...componentInstance.state, ...newState };
    }
  }
  // 类组件的虚拟dom（也是react元素） 记录当前渲染的组件实例对象
  element.componentInstance = componentInstance;
  // 拿到渲染的react元素
  const renderElement = componentInstance.render();
  // 组件实例记录渲染的 虚拟dom（react元素）
  componentInstance.renderElement = renderElement;
  // 真实dom
  const newDom = createDOM(renderElement);
  // TODO 组件挂载完成
  componentInstance.componentDidMount?.();
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
  const { type, props, ref } = element;
  // 1. 创建真实dom元素
  const dom = document.createElement(type);
  // 2. 处理子节点
  createDOMChildren(dom, element.props.children);
  // 3. 处理props
  setProps(dom, props);
  // TODO 处理ref
  if (ref) {
    ref.current = dom;
  }
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
