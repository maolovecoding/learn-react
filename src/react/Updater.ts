import { Component } from "./Component";
import { isFunction } from "./utils";
/**
 * 一个类组件实例有一个更新器
 * 区分批量更新 和同步更新
 * TODO  什么情况下会发生批量更新？
 * 1. 事件监听函数下，是批量更新的
 * 2. 生命周期函数 也是批量更新的
 */
export class Updater {
  /**
   * 因为更新可能是批量的，如果是批量更新 则暂存所有的状态 最后一次性更新
   *
   * @private
   * @memberof Updater
   */
  private pendingStates: any[] = [];
  /**
   * 新的props对象
   *
   * @private
   * @memberof Updater
   */
  private nextProps = null;
  constructor(public instance: Component) {}
  addState(partialState: any) {
    // 记录新状态
    this.pendingStates.push(partialState);
    // 试图更新
    this.emitUpdate();
  }
  /**
   * 触发更新操作
   * @param nextProps 可能会传一个 新的 属性对象
   */
  emitUpdate(nextProps?) {
    this.nextProps = nextProps;
    // 如果传递了新的属性对象 或者当前是非批量更新模式 则直接更新 不然则放入更新队列 暂时不更新
    if (nextProps || !updateQueue.isPending) {
      // 有新props 或者不是批量更新模式 则立刻更新
      this.updateComponent();
    } else {
      // 批量更新模式
      updateQueue.add(this);
    }
  }
  /**
   * 更新组件
   */
  updateComponent() {
    const { instance, pendingStates, nextProps } = this;
    if (nextProps || pendingStates.length > 0) {
      // 有等待执行执行合并的新状态
      shouldUpdate(instance, nextProps, this.getState());
    }
  }
  /**
   * 获取当前计算需要更新的部分状态后的最新状态
   */
  getState() {
    const { instance, pendingStates } = this;
    // 老组件实例的当前状态
    let { state } = instance;
    if (pendingStates.length) {
      // setState的参数 也可能是一个函数 如果是函数就执行 并把老state传递过去
      pendingStates.forEach((partialState) => {
        if (isFunction(partialState)) {
          // 计算新状态 作为最新的状态
          state = { ...state, ...partialState.call(instance, state) };
        } else {
          // 合并状态
          state = { ...state, ...partialState };
        }
      });
    }
    // 清空收集的更新的部分状态
    pendingStates.length = 0;
    // 返回的是最新的状态 nextState
    return state;
  }
}
/**
 * 决定是否要更新
 * @param instance
 * @param nextProps
 * @param state
 */
function shouldUpdate(instance: Component, nextProps, nextState) {
  instance.props = nextProps;
  instance.state = nextState;
  // 是否更新
  if (
    instance.shouldComponentUpdate &&
    !instance.shouldComponentUpdate(nextProps, nextState)
  ) {
    // 不更新
    return false;
  }
  // 强制更新
  instance.forceUpdate();
}
/**
 * 更新队列
 */
export let updateQueue = {
  updaters: [] as Updater[], // 将要执行的更新器对象
  isPending: false, // 是否批量更新  true表示批量更新（也就是会保存更新器对象，直到为false开始真正的更新）
  // 添加更新器对象
  add(updater: Updater) {
    this.updaters.push(updater);
  },
  // 批量更新 强制全部更新 开始真正的更新
  batchUpdate() {
    const { updaters } = this;
    this.isPending = true;
    let updater: Updater | undefined;
    while ((updater = updaters.pop())) {
      updater.updateComponent();
    }
    this.isPending = false;
  },
};
