# learn react

提交记录：

1. react 合成事件
2. react 函数式组件 和类组件的渲染
3. react 的批量更新原理，setState同步异步？
4. 组件更新，dom diff
    深度优先比较，先更新父节点的属性，在更新子节点是属性，先更新子节点的位置等信息（增删节点，移动），在移动父节点的位置
5. 生命周期
6. Provider Consumer 生命周期的批量更新模式

## setState

默认情况下，在事件监听函数的处理，以及生命周期函数中，setState都是批量更新的。
在setTimeout等情况下，是同步更新状态的，也就是在下面可以立刻拿到最新的state了。
