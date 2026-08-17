import { MODEL_FAMILIES } from "./models.ts";

export type SearchField = {
  value?: string | null;
  weight: number;
  key: string;
};

export type SearchMatch = {
  score: number;
  field: string;
  text: string;
};

type HighlightPart = {
  text: string;
  matched: boolean;
};

function normalizeText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().trim();
}

function queryTokens(query: string) {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * 模型家族之外的中英同义词组。aimap 等外部入口按中文实体名跳转
 * /cases?q=<名称>，库内案例基本写英文模型名，缺映射时中文查询整批落空。
 * 只登记「确认指同一产品」的叫法，不做模糊联想；模型家族内的别名组
 * （models.ts 的 aliases）会一并生效，不要在这里重复登记。
 */
const EXTRA_SYNONYM_GROUPS: string[][] = [
  ["glm", "智谱", "chatglm"],
  ["minimax", "hailuo", "海螺"],
  ["doubao", "豆包"],
  ["kimi", "月之暗面", "moonshot"],
  // 即梦（Dreamina）是字节的创作入口，背后同时有 Seedance（视频）和
  // Seedream（图像）两个模型。故意拆成两组、不合并成一组：
  // expandTerm 是跨组累加的，「即梦」在两组里都出现，所以搜「即梦」会
  // 展开到 seedance + seedream（平台词覆盖两个模型，符合预期）；而
  // 「seedance」只出现在第一组，展开时不会带出 seedream，避免把
  // 视频模型的搜索结果误拉进图像模型（反之亦然）。
  ["seedance", "即梦", "jimeng", "dreamina"],
  ["seedream", "即梦", "jimeng", "dreamina"],
  // 裸词「通义」只登记在这里，不进 models.ts 的 qwen-image aliases：
  // 那个字段同时驱动 caseMatchesModel 的子串匹配，裸「通义」会把
  // 「通义万相」「通义听悟」误判进 Qwen Image。搜索场景没有这个问题
  // （用户搜「通义」找到 Qwen 案例是想要的），所以映射单独放这里，
  // 合成 SYNONYM_GROUPS 时也不会流向 models.ts 的消费方。
  ["通义", "qwen", "千问", "通义千问"],
];

const SYNONYM_GROUPS: string[][] = [
  ...MODEL_FAMILIES.map((family) => family.aliases),
  ...EXTRA_SYNONYM_GROUPS,
];

/**
 * 查询词恰好等于某个同义词组里的词时，扩展出整组变体；否则原样返回。
 * 只做整词相等判定，不做子串触发——「qwen3」不该被扩展成「千问」，
 * 因为它比组内词更具体，扩展反而会把不相干的结果混进来。
 */
function expandTerm(term: string): string[] {
  const variants = [term];
  for (const group of SYNONYM_GROUPS) {
    if (!group.includes(term)) continue;
    for (const synonym of group) {
      if (!variants.includes(synonym)) variants.push(synonym);
    }
  }
  return variants;
}

function countOccurrences(value: string, token: string) {
  if (!token) return 0;
  let count = 0;
  let start = 0;
  while (start < value.length) {
    const index = value.indexOf(token, start);
    if (index < 0) break;
    count += 1;
    start = index + token.length;
  }
  return count;
}

type FieldScore = {
  field: string;
  text: string;
  score: number;
  /** 命中的 token 组下标，结果级跨字段并集判定用。 */
  matchedGroups: number[];
  fullCoverage: boolean;
};

/**
 * 单字段打分，不做「必须全部 token 命中」的门槛判断——门槛判断挪到结果级
 * （见 getSearchMatch），这里只负责：这个字段命中了多少、分数多高、是否
 * 自己就覆盖了全部 token（fullCoverage，用来判断能不能单独作为展示字段）。
 *
 * token 以同义词组为单位：组内任意变体命中即算该 token 命中（千问→qwen）。
 * 没有同义词的 token 组内只有自己，行为与纯子串匹配完全一致。
 */
function scoreField(
  value: string,
  phraseVariants: string[],
  tokenGroups: string[][],
  weight: number
): FieldScore {
  const normalizedValue = normalizeText(value);
  const phraseMatch = phraseVariants.some((phrase) =>
    normalizedValue.includes(phrase)
  );
  const matchedVariants: string[] = [];
  const matchedGroups: number[] = [];
  tokenGroups.forEach((group, index) => {
    const hit = group.find((variant) => normalizedValue.includes(variant));
    if (hit !== undefined) {
      matchedVariants.push(hit);
      matchedGroups.push(index);
    }
  });

  if (!phraseMatch && matchedGroups.length === 0) {
    return { field: "", text: value, score: 0, matchedGroups, fullCoverage: false };
  }

  const exactPhraseBonus = phraseMatch ? 70 : 0;
  const startsWithBonus = phraseVariants.some((phrase) =>
    normalizedValue.startsWith(phrase)
  )
    ? 24
    : 0;
  const frequencyBonus = matchedVariants.reduce(
    (total, variant) => total + Math.min(countOccurrences(normalizedValue, variant), 3) * 4,
    0
  );
  const score = weight + exactPhraseBonus + startsWithBonus + matchedGroups.length * 16 + frequencyBonus;
  const fullCoverage = phraseMatch || matchedGroups.length === tokenGroups.length;

  return { field: "", text: value, score, matchedGroups, fullCoverage };
}

/**
 * 返回一个结果最有价值的命中字段。字段权重让标题/作者优先于长 Prompt，
 * 但 Prompt 仍然可以把真实证据搜出来。
 *
 * 命中判定是结果级的：多词查询里，每个 token 只要在任意一个可搜字段命中即可
 * （例如「模型」在 model 字段命中、「主题」在 title 字段命中），只要全部 token
 * 都在某个字段里找到了归属，这条记录就算命中——不再要求所有 token 挤进同一个
 * 字段。字段自身的打分和「是否自己就覆盖了全部 token」仍然分开算，用来挑
 * 展示字段：优先选单字段就命中全部 token 的（更精确、更适合做高亮片段），
 * 都没有这种字段时，退化为按分数最高的部分命中字段展示。
 */
export function getSearchMatch(
  fields: SearchField[],
  query: string
): SearchMatch | null {
  const normalizedQuery = normalizeText(query);
  const tokens = queryTokens(query);
  if (!normalizedQuery || tokens.length === 0) return null;
  const phraseVariants = expandTerm(normalizedQuery);
  const tokenGroups = tokens.map(expandTerm);

  const fieldScores = fields
    .filter((field): field is SearchField & { value: string } => Boolean(field.value?.trim()))
    .map((field) => ({
      ...scoreField(field.value, phraseVariants, tokenGroups, field.weight),
      field: field.key,
    }));

  // 结果级判定：全部 token 组是否都在某个字段里找到了归属（跨字段并集）。
  const coveredGroups = new Set<number>();
  for (const entry of fieldScores) {
    for (const index of entry.matchedGroups) coveredGroups.add(index);
  }
  if (coveredGroups.size !== tokenGroups.length) return null;

  const hits = fieldScores.filter((entry) => entry.score > 0);
  const fullCoverageHits = hits.filter((entry) => entry.fullCoverage);
  const pool = fullCoverageHits.length > 0 ? fullCoverageHits : hits;

  const best = pool.sort((a, b) => b.score - a.score || a.field.localeCompare(b.field))[0];
  return best ? { field: best.field, text: best.text, score: best.score } : null;
}

export function rankSearchResults<T>(
  list: T[],
  query: string,
  getFields: (item: T) => SearchField[]
) {
  if (!query.trim()) {
    return list.map((item) => ({ item, match: null }));
  }

  return list
    .map((item, index) => ({ item, match: getSearchMatch(getFields(item), query), index }))
    .filter((result): result is { item: T; match: SearchMatch; index: number } => result.match !== null)
    .sort((a, b) => b.match.score - a.match.score || a.index - b.index);
}

/** 取带命中的短片段，避免搜索 Prompt 时卡片仍然只显示泛化摘要。 */
export function getSearchSnippet(match: SearchMatch, query: string, maxLength = 150) {
  const text = match.text.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const normalizedText = normalizeText(text);
  // 展开同义词变体：搜「千问」命中的是「Qwen」时，片段也要定位到 Qwen 附近。
  const tokens = [normalizeText(query), ...queryTokens(query)]
    .filter(Boolean)
    .flatMap(expandTerm);
  const hitIndex = tokens
    .map((token) => normalizedText.indexOf(token))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0] ?? 0;
  const context = Math.max(24, Math.floor((maxLength - 2) / 2));
  const start = Math.max(0, hitIndex - context);
  const end = Math.min(text.length, start + maxLength - 2);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export function splitHighlightedText(text: string, query: string): HighlightPart[] {
  const tokens = queryTokens(query);
  if (!text || tokens.length === 0) return [{ text, matched: false }];

  // 展开同义词变体后再去重、按长度降序（长词优先，避免短词截断长词的高亮）：
  // 搜「千问」时正文里的「Qwen」也要标亮。
  const phrase = normalizeText(query);
  const patterns = [phrase, ...tokens]
    .flatMap(expandTerm)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${patterns.map(escapeRegExp).join("|")})`, "giu");
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      matched: patterns.some((token) => normalizeText(part) === token),
    }));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
