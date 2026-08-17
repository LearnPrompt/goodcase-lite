// /agent-api 文档页的局部文案字典。
//
// 刻意不进 src/i18n/messages.ts：那份是全站共享词表，进去的每个键都会被
// 全站 bundle 带上，而这页的文案（端点说明、限额口径、错误码）只有这一页会用，
// 而且会跟着 API 版本一起改。放在页面自己的模块里，改 API 时文案就在隔壁，
// 不用横跨一个全局文件去找。

import {
  ANONYMOUS_HOURLY_LIMIT,
  DEFAULT_DAILY_LIMIT,
} from "@/lib/api-keys";
import { PROVENANCE_POLICY_EFFECTIVE_AT } from "@/lib/provenance";

export type PageLocale = "zh-CN" | "en";

type Copy = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  statAnonymousLabel: string;
  statAnonymousValue: string;
  statAnonymousHint: string;
  statKeyedLabel: string;
  statKeyedValue: string;
  statKeyedHint: string;
  compatTitle: string;
  compatBody: string;
  endpointsEyebrow: string;
  endpointsTitle: string;
  listHeading: string;
  detailHeading: string;
  detailBody: string;
  paramsHeading: string;
  responseHeading: string;
  provenanceEyebrow: string;
  provenanceTitle: string;
  provenanceBody: string;
  provenanceFields: [string, string][];
  limitsEyebrow: string;
  limitsTitle: string;
  limitsBody: string;
  tierHeaders: [string, string, string];
  tiers: [string, string, string][];
  headersHeading: string;
  headerRows: [string, string][];
  errorsHeading: string;
  errorRows: [string, string][];
  keysEyebrow: string;
  keysTitle: string;
  keysBody: string;
  keysSteps: string[];
  keysCta: string;
  skillEyebrow: string;
  skillTitle: string;
  skillBody: string;
  skillAfter: string;
  params: [string, string][];
};

const SITE_HELP_PATH = "/connect#feedback";

export const AGENT_API_CONTACT_PATH = SITE_HELP_PATH;

const zh: Copy = {
  metaTitle: "Agent API",
  metaDescription:
    "goodcase.ai 的 Agent API：免 key 即可调用，带 key 有更高日配额；每条案例附带可核验的溯源声明。",
  heroEyebrow: "Agent API · 面向机器的读取接口",
  heroTitle: "让 Agent 生成之前，先查一条真的 prompt。",
  heroDescription:
    "这套接口只做一件事：把人工核过出处的案例和完整 prompt 交给你的 Agent。免 key 就能开始用，量大了再申请 key 换更高配额。",
  statAnonymousLabel: "免 key",
  statAnonymousValue: `${ANONYMOUS_HOURLY_LIMIT} 次/小时`,
  statAnonymousHint: "按 IP · 软限",
  statKeyedLabel: "带 key",
  statKeyedValue: `${DEFAULT_DAILY_LIMIT.toLocaleString("en-US")} 次/天`,
  statKeyedHint: "默认额度 · 可调",
  compatTitle: "已经在用的调用不受影响",
  compatBody:
    "这套接口一直是匿名开放的，现在依然是。不带认证头的请求照常返回同样的数据，只是加了一层按 IP 的频率软限；已经装了 goodcase Skill 的用户什么都不用改。认证头只有以 gc_ 开头时才会被当作 API key —— 请求里碰巧有别的 Authorization 头不会让你被拒。",
  endpointsEyebrow: "01 · 端点",
  endpointsTitle: "两个端点，都是 GET",
  listHeading: "案例列表",
  detailHeading: "单条全量",
  detailBody:
    "在列表字段之外，额外返回 promptFull（完整 prompt）、editorNote（编辑点评）、labNote（实验笔记）、spreadScore（传播势能分）与 sourceHeatNote（热度计算说明）。",
  paramsHeading: "查询参数",
  responseHeading: "响应示例（截取）",
  provenanceEyebrow: "02 · 溯源",
  provenanceTitle: "每条案例都带一个可核验的出处声明",
  provenanceBody: `训练数据里最不缺的就是看起来很专业、其实从没人跑通过的 prompt。我们收录的每条案例都要求人工核对与原帖一致，平台拿产出图逆向重构出来的 prompt 一律不收。这条规则自 ${PROVENANCE_POLICY_EFFECTIVE_AT} 起对全部发布内容生效，现在它以结构化字段出现在响应里，Agent 可以直接读，不用信我们嘴上说。`,
  provenanceFields: [
    ["sourceUrl", "原帖地址。没有可公开原帖的案例这里是 null。"],
    [
      "verifiedAgainstSource",
      "prompt 是否经人工核对与原帖一致。没有原帖时为 false —— 无从对照就不做声明。",
    ],
    ["method", "核验方式标识。未来新增取值时，请按未知值降级处理。"],
    ["policyEffectiveAt", "溯源准入规则的生效日期，不是逐条的核验时间戳。"],
    ["note", "给人读的一句话说明，跟随 locale 参数。"],
  ],
  limitsEyebrow: "03 · 限额",
  limitsTitle: "两档配额，一套响应头",
  limitsBody:
    "免 key 那档是软限：接口跑在 Serverless 上，每个实例各有一份内存计数窗口，所以实际放行量会高于标称值，实例回收时还会清零。它拦的是写错循环条件的脚本，不是精确配额。真正准确的配额挂在 key 上，计数落在数据库里，按 UTC 自然日重置。",
  tierHeaders: ["档位", "配额", "怎么用"],
  tiers: [
    [
      "免 key",
      `${ANONYMOUS_HOURLY_LIMIT} 次 / 小时 / IP`,
      "什么都不用做，直接 curl。",
    ],
    [
      "带 key",
      `默认 ${DEFAULT_DAILY_LIMIT.toLocaleString("en-US")} 次 / 天，可按需调高`,
      "Authorization: Bearer gc_xxx，或 X-API-Key: gc_xxx。",
    ],
  ],
  headersHeading: "限额响应头",
  headerRows: [
    ["X-RateLimit-Limit", "当前档位的上限。"],
    ["X-RateLimit-Remaining", "本窗口 / 本日剩余次数。"],
    ["X-RateLimit-Reset", "配额重置时刻，Unix 秒。"],
    ["X-RateLimit-Scope", "anonymous 或 key，用来确认你的 key 有没有生效。"],
    ["Retry-After", "仅 429 时出现，建议等待秒数。"],
  ],
  errorsHeading: "错误码",
  errorRows: [
    ["400", "参数非法，比如 category 传了未定义的值。"],
    ["401", "认证头以 gc_ 开头但无效或已吊销。去掉它就退回免 key 档。"],
    ["404", "slug 不存在。"],
    ["429", "触发频率软限或当日配额用尽，见 Retry-After。"],
  ],
  keysEyebrow: "04 · 申请 key",
  keysTitle: "v1 由人工签发",
  keysBody:
    "现在还没有自助注册。先手动发一批，把调用方是谁、怎么用、多少配额才合理弄清楚，再决定要不要做注册流 —— 过早自动化一个还没定型的流程，只会换来一堆僵尸 key。",
  keysSteps: [
    "在反馈表里说明用途、预估日调用量和联系方式。",
    "我们签发后把明文 key 私下发给你，它只出现一次，我们这边只留哈希。",
    "把它放进 Authorization 头即可，不需要改任何其他调用代码。",
  ],
  keysCta: "去反馈表申请 →",
  skillEyebrow: "05 · Skill",
  skillTitle: "不想自己写请求？装 Skill",
  skillBody:
    "goodcase Skill 把上面这套接口包成自然语言查询，跨 Claude Code / Codex CLI / Cursor / Gemini CLI 通用，一行装完：",
  skillAfter:
    "装好之后直接问你的 AI「最近有什么好案例」，它会自己来查，而不是凭训练数据编一个。",
  params: [
    ["category", "image / video / web / copy / hardware，传别的值返回 400。"],
    [
      "q",
      "关键词，匹配标题 / 摘要 / 创作者，大小写不敏感，中英文都行。支持中英同义词扩展（如 千问→Qwen）。",
    ],
    ["take", "返回条数 1-50，默认 20，越界自动钳制。"],
    ["locale", "内容语言：zh-CN 或 en，默认 zh-CN。"],
  ],
};

const en: Copy = {
  metaTitle: "Agent API",
  metaDescription:
    "The GoodCase Agent API: anonymous access works out of the box, API keys raise the daily quota, and every case ships a verifiable provenance claim.",
  heroEyebrow: "Agent API · Machine-readable access",
  heroTitle: "Look up a real prompt before your agent generates.",
  heroDescription:
    "This API does one thing: hand your agent cases and full prompts whose sources have been checked by a human. Start without a key; ask for one when your volume grows.",
  statAnonymousLabel: "No key",
  statAnonymousValue: `${ANONYMOUS_HOURLY_LIMIT}/hour`,
  statAnonymousHint: "Per IP · soft limit",
  statKeyedLabel: "With key",
  statKeyedValue: `${DEFAULT_DAILY_LIMIT.toLocaleString("en-US")}/day`,
  statKeyedHint: "Default · adjustable",
  compatTitle: "Existing callers keep working",
  compatBody:
    "This API has always been anonymous and open, and it still is. Requests without an auth header return the same data as before, now under a soft per-IP rate limit. Anyone already running the goodcase Skill needs to change nothing. Only credentials starting with gc_ are treated as an API key, so an unrelated Authorization header will never get you rejected.",
  endpointsEyebrow: "01 · Endpoints",
  endpointsTitle: "Two endpoints, both GET",
  listHeading: "Case list",
  detailHeading: "Full case",
  detailBody:
    "On top of the list fields, this returns promptFull, editorNote, labNote, spreadScore, and sourceHeatNote.",
  paramsHeading: "Query parameters",
  responseHeading: "Response sample (truncated)",
  provenanceEyebrow: "02 · Provenance",
  provenanceTitle: "Every case carries a checkable source claim",
  provenanceBody: `Training data is full of prompts that read like expert work and were never actually run. Every case we publish must be checked by a human against the original post, and prompts a platform reverse-engineered from the output image are rejected outright. That rule has governed all published content since ${PROVENANCE_POLICY_EFFECTIVE_AT}; it now appears as a structured field so an agent can read it instead of taking our word for it.`,
  provenanceFields: [
    ["sourceUrl", "The original post. Null when no public source exists."],
    [
      "verifiedAgainstSource",
      "Whether the prompt was human-checked against the source. False when there is no source — nothing to check against, so no claim.",
    ],
    ["method", "Verification method id. Treat unknown future values as unverified."],
    ["policyEffectiveAt", "When the provenance rule took effect, not a per-case timestamp."],
    ["note", "A human-readable sentence, in the requested locale."],
  ],
  limitsEyebrow: "03 · Limits",
  limitsTitle: "Two tiers, one set of headers",
  limitsBody:
    "The anonymous tier is a soft limit. The API runs on serverless functions, each instance keeps its own in-memory window, so the effective allowance is higher than the stated number and resets when an instance recycles. It exists to catch a runaway loop, not to meter usage. Real metering lives on API keys, is counted in the database, and resets at 00:00 UTC.",
  tierHeaders: ["Tier", "Quota", "How"],
  tiers: [
    ["No key", `${ANONYMOUS_HOURLY_LIMIT} req / hour / IP`, "Nothing to do — just curl."],
    [
      "With key",
      `${DEFAULT_DAILY_LIMIT.toLocaleString("en-US")} req / day by default, raised on request`,
      "Authorization: Bearer gc_xxx, or X-API-Key: gc_xxx.",
    ],
  ],
  headersHeading: "Rate limit headers",
  headerRows: [
    ["X-RateLimit-Limit", "Ceiling for your current tier."],
    ["X-RateLimit-Remaining", "Calls left in this window or day."],
    ["X-RateLimit-Reset", "Reset time, Unix seconds."],
    ["X-RateLimit-Scope", "anonymous or key — confirms whether your key took effect."],
    ["Retry-After", "Only on 429; suggested wait in seconds."],
  ],
  errorsHeading: "Error codes",
  errorRows: [
    ["400", "Invalid parameter, e.g. an unknown category."],
    ["401", "A gc_ credential that is invalid or revoked. Drop it to fall back to the anonymous tier."],
    ["404", "No such slug."],
    ["429", "Soft rate limit or daily quota exhausted; see Retry-After."],
  ],
  keysEyebrow: "04 · Get a key",
  keysTitle: "v1 keys are issued by hand",
  keysBody:
    "There is no self-serve signup yet. We would rather issue the first batch manually, learn who is calling and what quota actually makes sense, and only then decide whether a signup flow is worth building.",
  keysSteps: [
    "Tell us your use case, rough daily volume, and how to reach you.",
    "We issue the key and send the plaintext privately. It is shown once; we store only a hash.",
    "Put it in the Authorization header. Nothing else about your calls changes.",
  ],
  keysCta: "Request a key →",
  skillEyebrow: "05 · Skill",
  skillTitle: "Skip the plumbing: install the Skill",
  skillBody:
    "The goodcase Skill wraps this API in natural-language queries and works across Claude Code, Codex CLI, Cursor, and Gemini CLI. One line:",
  skillAfter:
    "Then ask your AI what good cases are new, and it will look them up instead of inventing one from training data.",
  params: [
    ["category", "image / video / web / copy / hardware; anything else returns 400."],
    [
      "q",
      "Keyword across title, summary, and creator. Case-insensitive. Expands Chinese/English synonyms (e.g. 千问 → Qwen).",
    ],
    ["take", "1–50 items, defaults to 20, out-of-range values are clamped."],
    ["locale", "Content language: zh-CN or en. Defaults to zh-CN."],
  ],
};

export function getAgentApiCopy(locale: PageLocale): Copy {
  return locale === "en" ? en : zh;
}
