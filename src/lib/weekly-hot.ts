// 首页「本周最热」的选择逻辑。
//
// 这个模块被 内部测试脚本 用纯 node 直接加载，所以不能引入
// 任何运行时依赖：带 "@/" 别名的导入在 node 下解析不了，带扩展名的相对导入又会被
// Next 的打包链拒绝。同 src/lib/daily-digest.ts 和 src/lib/stability.ts 的约束。
//
// 数据只来自构建期已经拉好的 index 档，不新增任何运行期查询。首页 revalidate 是
// 86400，模块跟着每日重建刷新——对「周热」这个语义来说，这个新鲜度正好够。

const DAY_MS = 86_400_000;

/** 桌面两行三列，移动端自然折行。 */
export const WEEKLY_HOT_SIZE = 6;

/** 首选窗口：原帖发布在过去七天内。 */
export const WEEKLY_HOT_WINDOW_DAYS = 7;

/**
 * 兜底窗口。取 14 天不是随手选的：src/lib/daily-digest.ts 的
 * DAILY_DIGEST_FRESH_WINDOW_DAYS 也是 14，早报已经对外说过「最近两周发布的案例」，
 * 两处用同一个口径，用户不会在首页和早报上读到两种「最近」。
 */
export const WEEKLY_HOT_FALLBACK_WINDOW_DAYS = 14;

/**
 * 窗口按北京时间跨日。用固定偏移而不是 Intl 时区，保证服务端、构建脚本和测试
 * 算出同一天，同 daily-digest.ts 的 DAILY_DIGEST_OFFSET_MINUTES。
 */
export const WEEKLY_HOT_OFFSET_MINUTES = 8 * 60;

/**
 * 同一作者在六个槽位里最多占几条。
 *
 * 口径对齐 /cases 默认浏览的 diversifyByCreator({ maxConsecutive: 2 })：两处都是
 * 「同一个人最多连着看到两条」。但这里没有复用那个函数——它管的是相邻连排，
 * A A B A A B 在它看来完全合法，放到只有六格的首页模块里就是同一个人占了四格。
 * 六个槽位是一屏内一次看完的整体，需要的是总量上限而不是连排上限，所以这里另写
 * 一个 per-creator 计数。语义仍然跟着它走：「尽量」不是「保证」，剩余候选全是
 * 同一作者时允许超出上限，宁可超限也不留空位。
 */
export const WEEKLY_HOT_MAX_PER_CREATOR = 2;

export type WeeklyHotCandidate = {
  slug: string;
  /**
   * 作者名，用于同作者去重保护。
   *
   * 空值（缺失、null、全空白）不和任何条目算同一作者，各占各的桶：站里没署名的
   * 案例背后是一群互不相干的人，把它们当成同一个作者压到两条，等于因为缺少署名
   * 就把真正最热的条目挤下榜。字段名和 src/lib/creator-diversity.ts 的 CreatorLike
   * 对齐，两处能吃同一批对象。
   */
  creator?: string | null;
  creatorName?: string | null;
  /** 原帖发布时间。窗口筛选只认这个字段，缺失或不可解析的不进窗口。 */
  sourcePublishedAt?: string | null;
  /** 站内收录时间，只在最后一级兜底排序时当 sourcePublishedAt 的替补。 */
  createdAt?: string | null;
  /**
   * 全库口径的来源热度百分位。为 null 表示这条没有可核验的互动快照，
   * 不参与排名——和首页「来源互动榜」的过滤口径完全一致。
   */
  sourceHeatScore?: number | null;
  /** 并列时的裁决位：赞 + 2×评论 + 3×转发 + 4×收藏，见 src/lib/source-heat.ts。 */
  sourceWeightedInteractionCount?: number | null;
};

/**
 * 实际产出结果的那一级。
 *
 * 这个字段必须一路传到渲染层：线上数据的采集是批量的，原帖往往比收录早一到三周，
 * 所以七天窗口经常凑不满六条，兜底几乎每天都会触发。副题文案跟着这个值走，
 * 模块就永远不会在实际展示两周数据时嘴上说着「过去七天」。
 */
export type WeeklyHotWindow = "week" | "fortnight" | "latest";

export type WeeklyHotSelection<T> = {
  items: T[];
  window: WeeklyHotWindow;
  /** 产出这批结果的窗口里，有多少条参与了排名。latest 一级为 0。 */
  poolSize: number;
};

function toTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/** 把时间戳折算成北京时区下的日序号（1970-01-01 记为 0）。 */
function toDayNumber(
  value: string | number | Date | null | undefined,
  offsetMinutes: number
) {
  const ms =
    value instanceof Date
      ? value.getTime()
      : typeof value === "number"
        ? value
        : toTimestamp(value);

  if (ms === null || !Number.isFinite(ms)) {
    return null;
  }

  return Math.floor((ms + offsetMinutes * 60_000) / DAY_MS);
}

/** 热度分缺失时给 -1，排在所有有分数的后面；不会和真实的 0 分混淆的场景里够用。 */
function toScore(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : -1;
}

/** 并列裁决用码位序，不用 localeCompare——后者依赖 ICU，跨环境不稳。 */
function compareSlug(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

type Dated<T extends WeeklyHotCandidate> = { item: T; day: number | null };

/** 默认的作者取值：空白一律折成 null，交给上限逻辑当「无主」处理。 */
function defaultCreatorOf(item: WeeklyHotCandidate) {
  const name = item.creator ?? item.creatorName;
  const trimmed = typeof name === "string" ? name.trim() : "";
  return trimmed || null;
}

/**
 * 从已经排好序的候选里取前 size 条，同一作者最多 maxPerCreator 条。
 *
 * 超限的条目不是丢掉，而是记在一边：候选走完还没凑满时，再按原顺序放回来补位。
 * 所以「全库同一作者」这种极端情况下产出条数不变，只是上限形同虚设——这正是
 * creator-diversity.ts 说的「尽量不保证」。counts 允许由调用方预置，用来把前一阶段
 * 已经占用的名额带进来。
 */
function takeWithCreatorCap<E>(
  entries: readonly E[],
  size: number,
  maxPerCreator: number,
  creatorKeyOf: (entry: E) => string | null,
  counts: Map<string, number>
): E[] {
  const picked: E[] = [];
  const overflow: E[] = [];

  for (const entry of entries) {
    if (picked.length >= size) {
      return picked;
    }

    const key = creatorKeyOf(entry);
    if (key === null) {
      // 无署名的条目各占各的桶，不受上限约束。
      picked.push(entry);
      continue;
    }

    const used = counts.get(key) ?? 0;
    if (used >= maxPerCreator) {
      overflow.push(entry);
      continue;
    }

    counts.set(key, used + 1);
    picked.push(entry);
  }

  for (const entry of overflow) {
    if (picked.length >= size) {
      break;
    }
    picked.push(entry);
  }

  return picked;
}

/**
 * 热度排序。
 *
 * 用 sourceHeatScore 而不是裸的 sourceLikeCount：热度分已经在 source-heat.ts 里
 * 做过平台内归一，一条 500 赞的 X 帖和一条 500 赞的 GitHub 项目本来就不可比；
 * 而且它对缺失字段的处理是「不按 0 计」，裸字段做不到。分数并列时再看加权互动量，
 * 这一步在单平台的池子里几乎总能分出胜负。
 */
function compareHeat<T extends WeeklyHotCandidate>(a: Dated<T>, b: Dated<T>) {
  return (
    toScore(b.item.sourceHeatScore) - toScore(a.item.sourceHeatScore) ||
    toScore(b.item.sourceWeightedInteractionCount) -
      toScore(a.item.sourceWeightedInteractionCount) ||
    (b.day ?? -Infinity) - (a.day ?? -Infinity) ||
    compareSlug(a.item.slug, b.item.slug)
  );
}

/** 最后一级兜底的排序：先看原帖发布时间，没有就退到站内收录时间。 */
function compareRecency<T extends WeeklyHotCandidate>(a: T, b: T) {
  const aDay =
    toTimestamp(a.sourcePublishedAt) ?? toTimestamp(a.createdAt) ?? -Infinity;
  const bDay =
    toTimestamp(b.sourcePublishedAt) ?? toTimestamp(b.createdAt) ?? -Infinity;

  return bDay - aDay || compareSlug(a.slug, b.slug);
}

/**
 * 取窗口内可排名的候选。两个条件缺一不可：
 * 原帖发布时间落在 [nowDay - windowDays, nowDay]，且有可核验的热度分。
 * 未来时间的条目一律排除，采集脚本写错时区不至于把一条 case 钉在榜首。
 */
function poolWithin<T extends WeeklyHotCandidate>(
  dated: Array<Dated<T>>,
  nowDay: number,
  windowDays: number
) {
  return dated
    .filter(
      ({ item, day }) =>
        day !== null &&
        day <= nowDay &&
        nowDay - day < windowDays &&
        item.sourceHeatScore !== null &&
        item.sourceHeatScore !== undefined
    )
    .sort(compareHeat);
}

/**
 * 选出「本周最热」。
 *
 * 三级兜底，逐级放宽，产出哪一级由 window 字段如实报出：
 *
 * - week：原帖发布在过去七天内、有互动快照的案例，按热度取前六。凑满六条才用这一级。
 * - fortnight：同样的规则放宽到十四天。
 * - latest：十四天窗口也凑不满时，先放窗口内已有的几条，再按全库最新发布补齐到六条。
 *   补齐这一步不要求有热度分，因为它存在的唯一目的就是让首页这个区块永远不空。
 *
 * 前两级是整档替换而不是逐条补齐：六张卡要么全部来自七天，要么全部来自两周，
 * 副题才能用一句话准确描述整组内容。混着放的话，那句话对其中几张就是假的。
 *
 * 三级都套同一层同作者上限（WEEKLY_HOT_MAX_PER_CREATOR）。上限只管「选谁」，
 * 选完仍按热度降序展示，所以这六张卡从上往下读永远是单调的。
 *
 * now 由调用方传入（构建时刻），模块自己不读 Date.now，测试才能回放任意日期。
 */
export function selectWeeklyHot<T extends WeeklyHotCandidate>(
  items: readonly T[],
  now: Date | string | number,
  options: {
    size?: number;
    windowDays?: number;
    fallbackWindowDays?: number;
    offsetMinutes?: number;
    maxPerCreator?: number;
    /**
     * 自定义作者取值。返回 null 表示「这条没有可归属的作者」，不参与同作者上限。
     * 调用方用它把自己的占位署名（比如统一填充的「匿名作者」）还原成无主。
     */
    creatorOf?: (item: T) => string | null | undefined;
  } = {}
): WeeklyHotSelection<T> {
  const {
    size = WEEKLY_HOT_SIZE,
    windowDays = WEEKLY_HOT_WINDOW_DAYS,
    fallbackWindowDays = WEEKLY_HOT_FALLBACK_WINDOW_DAYS,
    offsetMinutes = WEEKLY_HOT_OFFSET_MINUTES,
    maxPerCreator = WEEKLY_HOT_MAX_PER_CREATOR,
    creatorOf,
  } = options;

  const creatorKeyOf = (item: T) => {
    const name = creatorOf ? creatorOf(item) : defaultCreatorOf(item);
    const trimmed = typeof name === "string" ? name.trim() : "";
    return trimmed || null;
  };

  const nowDay = toDayNumber(now, offsetMinutes);
  if (nowDay === null || items.length === 0 || size <= 0) {
    return { items: [], window: "latest", poolSize: 0 };
  }

  const dated = items.map((item) => ({
    item,
    day: toDayNumber(item.sourcePublishedAt, offsetMinutes),
  }));

  // 上限只影响「选谁」；被超限条目挤开的名次会落在队尾，这里再按热度排回来，
  // 保证展示出来的这几张卡自上而下始终是热度降序。
  const takeFromPool = (pool: Array<Dated<T>>) =>
    takeWithCreatorCap(
      pool,
      size,
      maxPerCreator,
      (entry) => creatorKeyOf(entry.item),
      new Map<string, number>()
    )
      .sort(compareHeat)
      .map((entry) => entry.item);

  const week = poolWithin(dated, nowDay, windowDays);
  if (week.length >= size) {
    return {
      items: takeFromPool(week),
      window: "week",
      poolSize: week.length,
    };
  }

  const fortnight = poolWithin(dated, nowDay, fallbackWindowDays);
  if (fortnight.length >= size) {
    return {
      items: takeFromPool(fortnight),
      window: "fortnight",
      poolSize: fortnight.length,
    };
  }

  // 窗口里有几条就先用几条，剩下的按全库最新发布补齐，顺序不打乱。
  // 窗口内那几条无条件保留（本来就不够数），但它们已经占掉的作者名额要带进补齐这步，
  // 否则「最多两条」在这一级会漏判。
  const picked = fortnight.map((entry) => entry.item);
  const taken = new Set(picked.map((item) => item.slug));
  const counts = new Map<string, number>();
  for (const item of picked) {
    const key = creatorKeyOf(item);
    if (key !== null) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const fill = takeWithCreatorCap(
    [...items].sort(compareRecency).filter((item) => {
      if (taken.has(item.slug)) {
        return false;
      }
      taken.add(item.slug);
      return true;
    }),
    size - picked.length,
    maxPerCreator,
    creatorKeyOf,
    counts
  );

  return { items: [...picked, ...fill], window: "latest", poolSize: 0 };
}
