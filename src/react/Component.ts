export abstract class Component<T = any> {
  props: T;
  constructor(props: T) {
    this.props = props;
  }
  abstract render();
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
