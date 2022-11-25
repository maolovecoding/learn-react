/**
 * 在fiber中 很多地方都用到了链表
 */
class Update {
  payload; // 数据 或者说元素
  nextUpdate: Update | null = null;
  constructor(payload, nextUpdate) {
    this.payload = payload;
    this.nextUpdate = nextUpdate;
  }
}

class UpdateQueue {
  baseState: any = null; // 原状态
  firstUpdate: Update | null = null; // 第一个更新
  lastUpdate: Update | null = null; // 最后一个更新
  // constructor(baseState) {
  //   this.baseState = baseState;
  // }
  enqueueUpdate(update: Update) {
    if (this.firstUpdate === null) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      this.lastUpdate!.nextUpdate = update;
      this.lastUpdate = update;
    }
  }
  /**
   * 获取老状态 然后遍历这里链表，进行更新
   */
  forceUpdate() {
    let currentState = this.baseState || {};
    let currentUpdate = this.firstUpdate;
    while (currentUpdate) {
      const nextState =
        typeof currentUpdate.payload === "function"
          ? currentUpdate.payload(currentState)
          : currentUpdate.payload;
      // 合并状态
      Object.assign(currentState, nextState);
      currentUpdate = currentUpdate.nextUpdate;
    }
    this.firstUpdate = this.lastUpdate = null; // 更新完毕 清空链表
    this.baseState = currentState;
    return currentState;
  }
}

export {};
