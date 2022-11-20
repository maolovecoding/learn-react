import { Updater } from "./Updater";
import { compareTwoElements } from "./vdom";

export abstract class Component<T = any> {
  props: T;
  state: any = {};
  // 更新对象 更新器 updater
  private $updater = new Updater(this);
  private nextProps = null; // 下一个属性对象
  renderElement = null; // 上次的render函数的渲染结果
  constructor(props: T) {
    this.props = props;
  }
  /**
   * 批量更新的实现
   */
  setState(partialState: any) {
    this.$updater.addState(partialState);
  }
  abstract render();

  /**
   * 组件强制更新 渲染
   */
  forceUpdate() {
    const { props, state, renderElement: oldRenderElement } = this;
    // 组件将要更新
    this.componentWillUpdate?.();
    const { getSnapshotBeforeUpdate } = this;
    const extraArgs = getSnapshotBeforeUpdate?.();
    // 执行react更新操作
    const newRenderElement = this.render();
    const currentRenderElement = compareTwoElements(
      oldRenderElement,
      newRenderElement
    );
    this.renderElement = currentRenderElement;
    // 组件更新完成的生命周期回调
    this.componentDidUpdate?.(props, state, extraArgs);
  }

  /**
   * 判断组件是否更新
   */
  shouldComponentUpdate?(nextProps: any, nextState: any): boolean;
  /**
   * TODO 组件将要开始更新 react17废弃
   */
  componentWillUpdate?(): void;
  /**
   * 组件更新完毕
   */
  componentDidUpdate?(nextProps, prevState, extraArgs): void;
  componentWillMount?(): void;
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  componentWDidUnmount?(): void;
  componentWillReceiveProps?(): void;
  getSnapshotBeforeUpdate?(): any;
}
/**
 *类组件和函数式组件编译后都是函数 通过 isReactComponent 区分是类组件还是函数组件
 *
 * @private
 * @memberof Component
 */
Object.defineProperty(Component, "isReactComponent", {
  value: true,
  writable: false,
  enumerable: true,
  configurable: false,
});
