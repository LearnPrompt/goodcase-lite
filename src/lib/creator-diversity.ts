/**
 * 在保持优先级尽量不变的前提下，避免默认浏览连续刷出同一作者。
 * 搜索结果不使用这个函数，以免破坏相关度排序。
 *
 * 注意这是「尽量」不是「保证」：剩余候选全是同一作者时会退回原顺序继续排，
 * 否则就得丢条目。列表尾部因此仍可能出现长于 maxConsecutive 的同作者连排。
 */
type CreatorLike = {
  creator?: string | null;
  creatorName?: string | null;
};

type CreatorKey = string | symbol;

type QueueEntry<T> = {
  item: T;
  index: number;
};

type CreatorQueue<T> = {
  key: CreatorKey;
  entries: QueueEntry<T>[];
  cursor: number;
};

/** 默认的作者取值：空白一律折成 null，交给下面当「无主」处理。同 weekly-hot.ts 的 defaultCreatorOf。 */
function defaultCreatorOf(item: CreatorLike) {
  const name = item.creator ?? item.creatorName;
  const trimmed = typeof name === "string" ? name.trim() : "";
  return trimmed || null;
}

export function diversifyByCreator<T extends CreatorLike>(
  items: T[],
  {
    maxConsecutive = 2,
    creatorOf,
  }: {
    maxConsecutive?: number;
    /**
     * 自定义作者取值。返回 null 表示「这条没有可归属的作者」，各占各的桶，不参与
     * 连排上限。调用方用它把自己的占位署名（比如统一填充的「匿名作者」）还原成无主，
     * 同 src/lib/weekly-hot.ts 的 selectWeeklyHot。
     */
    creatorOf?: (item: T) => string | null | undefined;
  } = {}
): T[] {
  if (maxConsecutive < 1 || items.length < 2) return [...items];

  const creatorKeyOf = (item: T) => {
    const name = creatorOf ? creatorOf(item) : defaultCreatorOf(item);
    const trimmed = typeof name === "string" ? name.trim() : "";
    return trimmed || null;
  };
  const queues = new Map<CreatorKey, CreatorQueue<T>>();

  items.forEach((item, index) => {
    const creator = creatorKeyOf(item);
    const key = creator ?? Symbol(`missing-creator-${index}`);
    const queue = queues.get(key);

    if (queue) queue.entries.push({ item, index });
    else queues.set(key, { key, entries: [{ item, index }], cursor: 0 });
  });

  const queueFrontIndex = (queue: CreatorQueue<T>) =>
    queue.entries[queue.cursor].index;
  const queueHeap: CreatorQueue<T>[] = [];

  const pushQueue = (queue: CreatorQueue<T>) => {
    queueHeap.push(queue);
    let index = queueHeap.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (
        queueFrontIndex(queueHeap[parentIndex]) <= queueFrontIndex(queue)
      ) {
        break;
      }
      queueHeap[index] = queueHeap[parentIndex];
      index = parentIndex;
    }

    queueHeap[index] = queue;
  };

  const popQueue = (): CreatorQueue<T> | undefined => {
    const first = queueHeap[0];
    const last = queueHeap.pop();

    if (queueHeap.length > 0 && last) {
      let index = 0;

      while (true) {
        const leftIndex = index * 2 + 1;
        if (leftIndex >= queueHeap.length) break;

        const rightIndex = leftIndex + 1;
        const childIndex =
          rightIndex < queueHeap.length &&
          queueFrontIndex(queueHeap[rightIndex]) <
            queueFrontIndex(queueHeap[leftIndex])
            ? rightIndex
            : leftIndex;

        if (
          queueFrontIndex(queueHeap[childIndex]) >= queueFrontIndex(last)
        ) {
          break;
        }

        queueHeap[index] = queueHeap[childIndex];
        index = childIndex;
      }

      queueHeap[index] = last;
    }

    return first;
  };

  for (const queue of queues.values()) pushQueue(queue);

  /**
   * 把所有队列里还没发出的条目按原始顺序收回来。
   *
   * 队列对象在 queues 里始终在册（只推进 cursor，从不删除），所以 cursor 之后的部分
   * 就是全部未发出的条目，堆里有没有它不影响。
   */
  const drainRemaining = () =>
    [...queues.values()]
      .flatMap((queue) => queue.entries.slice(queue.cursor))
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.item);

  const result: T[] = [];
  let lastCreator: CreatorKey | null = null;
  let consecutive = 0;

  while (queueHeap.length > 0) {
    const blockedQueue: CreatorQueue<T> | undefined =
      queueHeap[0].key === lastCreator && consecutive >= maxConsecutive
        ? popQueue()
        : undefined;
    let selectedQueue = popQueue();

    if (selectedQueue) {
      if (blockedQueue) pushQueue(blockedQueue);
    } else {
      selectedQueue = blockedQueue;
    }

    if (!selectedQueue) {
      // 走到这里意味着堆非空却弹不出队列，穷举对拍下不可达。但这个函数在 /cases 的
      // 渲染路径上，真触发时抛异常就是整页 500——一个「打散作者」的排序优化不值得
      // 换掉整页。这里退回按原顺序补完剩余条目：顺序不如打散过的好看，但一条不丢。
      result.push(...drainRemaining());
      break;
    }

    const next = selectedQueue.entries[selectedQueue.cursor];
    selectedQueue.cursor += 1;
    if (selectedQueue.cursor < selectedQueue.entries.length) {
      pushQueue(selectedQueue);
    }

    if (selectedQueue.key === lastCreator) consecutive += 1;
    else {
      lastCreator = selectedQueue.key;
      consecutive = 1;
    }
    result.push(next.item);
  }

  return result;
}
