/**
 * react 合成事件
 * 在react中 我们是把事件绑定在document 上 类似事件委托
 * 1. 合成事件屏蔽浏览器的差异，不同浏览器绑定事件和触发事件的方式不一样
 * 2. 合成可以实现事件对象复用，重用，减少垃圾回收，提高性能
 * 3. 因为默认要实现批量更新  两次setState合并为一个 也是在合成事件中实现的
 * @param dom
 * @param eventType
 * @param listener
 */
export function addEvent(
  dom: HTMLElement & { eventStore?: any },
  eventType: string,
  listener: any
) {
  eventType = eventType.toLowerCase(); // onClick => onclick
  // TODO  在要绑定的DOM节点上挂载一个对象 准备存放监听函数
  let eventStore = dom.eventStore || (dom.eventStore = {});
  // eventStore['onclick'] = listener
  eventStore[eventType] = listener;
  // 不管点什么dom 都冒泡给document  false 冒泡阶段处理
  // TODO  绑定事件的时候可以想办法抹平差异
  document.addEventListener(eventType.slice(2) as any, dispatchEvent, false);
}
/**
 *
 * @param event 原生事件对象
 * 传递给我们监听函数的 是我们包装后的event 不是原生的
 */
let syntheticEvent;
function dispatchEvent(event: any) {
  // TODO
  // type = click  target = dom
  let { type, target } = event;
  const eventType = "on" + type;
  // 模拟事件冒泡
  while (target) {
    // 取出存放的事件
    let { eventStore } = target as any;
    syntheticEvent = getSyntheticEvent(event); // 合成事件
    // 看是否有事件监听函数
    const listener = eventStore?.[eventType];
    if (typeof listener === "function") {
      syntheticEvent.currentTarget = target;
      // 执行事件监听函数
      listener.call(target, syntheticEvent);
    }
    target = target?.parentNode;
  }
  // 清空合成事件 (同步才能拿到合成事件对象了，异步的被清空了)
  for (const key in syntheticEvent) {
    if (key !== "persist") syntheticEvent[key] = null;
  }
}
/**
 * 创建合成事件对象 将原生事件对象拷贝一份
 * @param nativeEvent
 */
function getSyntheticEvent(nativeEvent: Event) {
  if (!syntheticEvent) syntheticEvent = new SyntheticEvent(nativeEvent);
  for (const key in nativeEvent) {
    if (typeof nativeEvent[key] === "function") {
      syntheticEvent[key] = nativeEvent[key].bind(nativeEvent);
    } else {
      syntheticEvent[key] = nativeEvent[key];
    }
  }
  return syntheticEvent;
}

class SyntheticEvent {
  currentTarget: any;
  constructor(private nativeEvent: Event) {}
  /**
   * 持久化 event合成事件 在后面 比如定时器中也可以拿到
   */
  persist() {
    // 创建一个新的合成事件 老的合成事件不在关心了
    // syntheticEvent = Object.assign(
    //   new SyntheticEvent(this.nativeEvent),
    //   syntheticEvent
    // );
    syntheticEvent = new SyntheticEvent(this.nativeEvent);
  }
}
