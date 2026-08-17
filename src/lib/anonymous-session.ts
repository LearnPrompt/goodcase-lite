// 匿名会话 ID 的唯一生成端。
//
// 原来只有埋点在用（src/lib/analytics.ts 里的 getSessionId），现在反应（点赞 /
// 催复测投票）也要拿同一个 ID 当防重键，所以提到这里共用一份，不再各造一套。
// 校验端在 src/lib/analytics-payload.ts 的 cleanSessionId 和
// src/lib/reactions-payload.ts 的 cleanSessionId，值域必须和这里产出的一致：
// 字母数字加连字符，8~100 位。
//
// 两种身份，刻意分开：
// - 埋点用 sessionStorage（一个标签页 = 一次会话），是 analytics_events 已有数据的
//   会话口径，不能动。
// - 反应（点赞 / 投票）用 localStorage 的持久身份：防重的设计语义是「同一浏览器
//   只算一次」，如果跟着标签页会话走，关一次浏览器就换新身份，计数会虚增。

const SESSION_KEY = "goodcase:analytics-session";
const REACTOR_KEY = "goodcase:reactor-id";

function readOrCreate(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const created =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  storage.setItem(key, created);
  return created;
}

/** 埋点会话 ID。拿不到存储（无痕模式、被禁用）时回 "ephemeral"，调用方按"这次不防重"处理。 */
export function getAnonymousSessionId(): string {
  try {
    return readOrCreate(window.sessionStorage, SESSION_KEY);
  } catch {
    return "ephemeral";
  }
}

/** 反应防重身份，跨会话持久。localStorage 不可用时退回会话 ID，再不行 "ephemeral"。 */
export function getReactorId(): string {
  try {
    return readOrCreate(window.localStorage, REACTOR_KEY);
  } catch {
    return getAnonymousSessionId();
  }
}
