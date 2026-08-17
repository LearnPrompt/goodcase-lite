import type { Locale } from "@/i18n/config";
// 相对路径 + 显式 .ts 后缀：这个文件会被 scripts/ops/lib/skills.test.mjs 和
// scripts/skills/generate-installable-skills.mjs 用相对路径直接 import
// （node --test 原生跑 TS，不认 tsconfig 的 "@/*" 路径别名）。之前这里只有
// import type（编译期整句被抹掉，不受影响），这是第一个值导入，
// 用 "@/lib/case-presentation" 会在测试里报 ERR_MODULE_NOT_FOUND，
// 参见 src/lib/creator-card-item.ts 顶部同类注释。
import { pickLatestAuthorDate } from "./case-presentation.ts";
import type { CaseCategory } from "@/lib/mock-data";
import { rankSearchResults, type SearchField } from "./search.ts";

type LocalizedText = Record<Locale, string>;

export type SkillCaseInput = {
  slug: string;
  title: string;
  category: CaseCategory;
  creator: string;
  tags?: string[];
  sourceUrl?: string;
  summary?: string;
  promptPreview?: string;
  promptFull?: string;
  promptContributionNotes?: string[];
  /**
   * promptContributionNotes 是这条 Case 自己写的复盘，还是按 category 拼的套话。
   * 生成端（src/lib/cases.ts 的 buildPromptContributionNotes）负责打标；
   * 缺省按 template 处理，即「没被证明是真内容的一律不当证据」。
   */
  promptContributionNotesSource?: "authored" | "template";
  resultBreakdown?: [string, string, string];
  mediaType?: "image" | "video";
  mediaUrl?: string;
  posterUrl?: string;
  /** 「最近例证」取数用：作者侧发布时间，缺失时退收录时间。两者都没有就不参与排序。 */
  sourcePublishedAt?: string;
  createdAt?: string;
};

export type SkillCreatorEvidence = {
  name: string;
  caseCount: number;
};

export type SkillLink = {
  slug: string;
  title: string;
  kind: "shared" | "creator_method";
};

export type DerivedSkill<T extends SkillCaseInput = SkillCaseInput> = {
  slug: string;
  baseSlug: string;
  kind: "shared" | "creator_method";
  title: string;
  description: string;
  category: CaseCategory;
  methodSteps: string[];
  cases: T[];
  creators: SkillCreatorEvidence[];
  caseCount: number;
  creatorCount: number;
  generalSkillSlug: string | null;
  /**
   * 「最近例证」——支撑这个 Skill 的案例里最新的 sourcePublishedAt（缺失时退
   * createdAt），格式化成 YYYY/MM/DD。只展示作者侧时间，不展示编辑/收录时间。
   * 一条可用日期都没有时是 null。
   */
  latestExampleDate: string | null;
};

export type SkillCatalog<T extends SkillCaseInput = SkillCaseInput> = {
  sharedSkills: DerivedSkill<T>[];
  creatorMethods: DerivedSkill<T>[];
  allSkills: DerivedSkill<T>[];
};

type SkillDefinition = {
  slug: string;
  category: CaseCategory;
  title: LocalizedText;
  description: LocalizedText;
  methodSteps: Record<Locale, string[]>;
  signals: RegExp;
  priority: number;
};

const SHARED_MIN_CASES = 3;
const SHARED_MIN_CREATORS = 2;
const CREATOR_METHOD_MIN_CASES = 3;
const CREATOR_METHOD_LIMIT = 2;
const MAX_CASE_SKILLS = 2;

export const SKILL_DEFINITIONS: readonly SkillDefinition[] = [
  {
    slug: "editorial-portrait-composition",
    category: "image",
    title: {
      "zh-CN": "编辑肖像构图",
      en: "Editorial portrait composition",
    },
    description: {
      "zh-CN": "用人物姿态、造型、光线和留白，构成可重复迁移的编辑人像。",
      en: "Build repeatable editorial portraits from pose, styling, light, and negative space.",
    },
    methodSteps: {
      "zh-CN": ["先定人物身份与情绪", "明确景别、姿态和视线", "锁定光线、材质与背景留白"],
      en: ["Set identity and emotion", "Specify framing, pose, and gaze", "Lock light, texture, and negative space"],
    },
    signals: /(肖像|人像|时尚|fashion|portrait|editorial|写真|偶像|模特|美妆)/i,
    priority: 35,
  },
  {
    slug: "poster-information-hierarchy",
    category: "image",
    title: {
      "zh-CN": "海报信息层级",
      en: "Poster information hierarchy",
    },
    description: {
      "zh-CN": "把主视觉、标题、辅助信息和版式约束写成一套可替换的海报骨架。",
      en: "Turn the hero visual, headline, support copy, and layout constraints into a reusable poster frame.",
    },
    methodSteps: {
      "zh-CN": ["先写主标题与视觉中心", "约束版式网格和文字层级", "最后补色彩、纹理与输出规格"],
      en: ["Set the headline and visual center", "Constrain the grid and type hierarchy", "Add color, texture, and output specs"],
    },
    signals: /(海报|poster|信息图|infographic|拼贴|collage|封面|cover|排版|typography|邀请函)/i,
    priority: 40,
  },
  {
    slug: "product-studio-visual",
    category: "image",
    title: {
      "zh-CN": "产品视觉棚拍",
      en: "Product studio visual",
    },
    description: {
      "zh-CN": "围绕产品主体、材质、布光和商业场景组织可复用的静物视觉。",
      en: "Organize reusable product stills around the object, material, lighting, and commercial setting.",
    },
    methodSteps: {
      "zh-CN": ["锁定产品形态与材质", "定义机位、光比和反射", "补品牌场景与商业留白"],
      en: ["Lock product form and material", "Define camera, light ratio, and reflections", "Add brand context and commercial space"],
    },
    signals: /(产品|商品|product|packaging|静物|香水|skincare|护肤|logo|电商|商业|广告)/i,
    priority: 45,
  },
  {
    slug: "character-style-consistency",
    category: "image",
    title: {
      "zh-CN": "角色设定与风格统一",
      en: "Character and style consistency",
    },
    description: {
      "zh-CN": "用角色特征、服装道具、世界观和画风约束保持同一角色的一致性。",
      en: "Keep a character coherent through traits, costume, props, worldbuilding, and style constraints.",
    },
    methodSteps: {
      "zh-CN": ["固定角色识别特征", "补服装、道具与动作", "用画风和世界观约束统一输出"],
      en: ["Fix identifying traits", "Add costume, props, and action", "Unify output with style and world constraints"],
    },
    signals: /(动漫|anime|角色|character|漫画|奇幻|fantasy|插画|illustration|卡牌|扑克牌|3d cg)/i,
    priority: 42,
  },
  {
    slug: "product-ad-shot-design",
    category: "video",
    title: {
      "zh-CN": "产品广告镜头",
      en: "Product ad shot design",
    },
    description: {
      "zh-CN": "从产品卖点出发，编排开场钩子、使用场景和品牌收束镜头。",
      en: "Turn a product benefit into an opening hook, usage scene, and branded closing shot.",
    },
    methodSteps: {
      "zh-CN": ["先确定单一产品卖点", "用动作或场景证明卖点", "以品牌特写或行动指令收束"],
      en: ["Choose one product benefit", "Prove it through action or context", "Close on brand detail or a call to action"],
    },
    signals: /(广告|商业|产品|product|commercial|品牌|brand|美妆|口红|饮料|汽水|咖啡|护肤|soda|ugc)/i,
    priority: 45,
  },
  {
    slug: "action-continuity-choreography",
    category: "video",
    title: {
      "zh-CN": "动作连续性编排",
      en: "Action continuity choreography",
    },
    description: {
      "zh-CN": "把角色、运动方向、节奏和镜头衔接写成可复现的动作序列。",
      en: "Make action reproducible by specifying character, direction, rhythm, and shot continuity.",
    },
    methodSteps: {
      "zh-CN": ["固定角色与运动方向", "拆分起势、冲突和收束", "逐镜约束机位、速度与连续性"],
      en: ["Fix character and movement direction", "Split setup, conflict, and resolution", "Constrain camera, speed, and continuity shot by shot"],
    },
    signals: /(战斗|对决|动作|武术|功夫|追逐|fight|battle|action|chase|剑|骑士|战争|坠落|跑酷)/i,
    priority: 50,
  },
  {
    slug: "pov-vlog-presence",
    category: "video",
    title: {
      "zh-CN": "POV / Vlog 临场感",
      en: "POV and vlog presence",
    },
    description: {
      "zh-CN": "用第一视角、手持运动和生活化细节制造可信的在场感。",
      en: "Create credible presence through first-person framing, handheld movement, and lived-in detail.",
    },
    methodSteps: {
      "zh-CN": ["明确拍摄者身份与设备", "写出移动路径和偶发细节", "保留手持瑕疵与真实环境声画"],
      en: ["Define the shooter and device", "Write the movement path and incidental detail", "Keep handheld imperfection and environmental texture"],
    },
    signals: /(vlog|pov|fpv|自拍|手持|探店|纪录片|日常|回忆|journey|生活方式|网红|直播|骑行)/i,
    priority: 48,
  },
  {
    slug: "process-transformation-story",
    category: "video",
    title: {
      "zh-CN": "过程与变换叙事",
      en: "Process and transformation story",
    },
    description: {
      "zh-CN": "用明确起点、连续步骤和终态，把制作或变化过程压缩成可读叙事。",
      en: "Compress making or transformation into a readable story with a clear start, continuous steps, and end state.",
    },
    methodSteps: {
      "zh-CN": ["先定义起点与最终结果", "挑出必须看见的中间步骤", "用同机位或连续动作连接变化"],
      en: ["Define the start and final state", "Select the essential intermediate steps", "Connect change with a stable camera or continuous action"],
    },
    signals: /(烹饪|制作|烘焙|cooking|baking|recipe|过程|流程|延时|time.?lapse|变换|改造|自建)/i,
    priority: 44,
  },
  {
    slug: "animation-style-consistency",
    category: "video",
    title: {
      "zh-CN": "动画风格与角色一致性",
      en: "Animation style and character consistency",
    },
    description: {
      "zh-CN": "在多镜头动画中固定角色造型、运动语言和材质画风。",
      en: "Keep character design, movement language, and visual texture stable across animated shots.",
    },
    methodSteps: {
      "zh-CN": ["固定角色设定表", "统一动作节奏和镜头语法", "重复声明材质、线条与色彩规则"],
      en: ["Fix a character sheet", "Unify motion rhythm and shot grammar", "Repeat material, line, and color rules"],
    },
    signals: /(动漫|anime|动画|animation|皮克斯|pixar|吉卜力|ghibli|定格|stop.?motion|2d|3d)/i,
    priority: 30,
  },
  {
    slug: "landing-page-information-structure",
    category: "web",
    title: {
      "zh-CN": "落地页信息结构",
      en: "Landing-page information structure",
    },
    description: {
      "zh-CN": "把价值主张、证据、功能与行动指令排成一条完整的页面阅读路径。",
      en: "Arrange value proposition, proof, features, and calls to action into one complete page journey.",
    },
    methodSteps: {
      "zh-CN": ["首屏只讲一个价值主张", "按问题、证据、功能组织模块", "让每段内容导向同一行动"],
      en: ["Keep one value proposition above the fold", "Order problem, proof, and features", "Make every section lead to one action"],
    },
    signals: /(落地页|landing|官网|网站|site|产品站|waitlist|startup|单页|多页|网页)/i,
    priority: 20,
  },
  {
    slug: "web-3d-motion-hero",
    category: "web",
    title: {
      "zh-CN": "3D / 动效 Hero",
      en: "3D and motion hero",
    },
    description: {
      "zh-CN": "用单一视觉主角、滚动或交互节奏和性能边界组织网页首屏动效。",
      en: "Build a motion-led hero around one visual subject, an interaction rhythm, and a clear performance budget.",
    },
    methodSteps: {
      "zh-CN": ["先定唯一视觉主角", "写清滚动或交互触发关系", "限制首屏资源与移动端降级"],
      en: ["Choose one visual protagonist", "Specify scroll or interaction triggers", "Limit first-load assets and mobile fallback"],
    },
    signals: /(3d|webgl|three\.js|动效|动画|animation|滚动|scroll|电影感|cinematic|hero|交互)/i,
    priority: 50,
  },
  {
    slug: "portfolio-story-architecture",
    category: "web",
    title: {
      "zh-CN": "个人作品集叙事",
      en: "Portfolio story architecture",
    },
    description: {
      "zh-CN": "围绕创作者定位、代表作品和可信证据安排个人站的叙事顺序。",
      en: "Order a personal site around positioning, representative work, and trust evidence.",
    },
    methodSteps: {
      "zh-CN": ["一句话说清创作者定位", "用代表作品而非技能清单证明能力", "补过程、客户或联系方式形成闭环"],
      en: ["State the creator position in one line", "Prove ability with work, not skill lists", "Close with process, clients, or contact"],
    },
    signals: /(作品集|portfolio|个人|机构|studio|agency|档案|摄影师|导演|品牌)/i,
    priority: 45,
  },
  {
    slug: "product-commerce-conversion-page",
    category: "web",
    title: {
      "zh-CN": "产品与电商转化页",
      en: "Product and commerce conversion page",
    },
    description: {
      "zh-CN": "把商品或 SaaS 的选择、信任和购买路径压缩成清晰的转化界面。",
      en: "Compress selection, trust, and purchase into a clear conversion path for a product or SaaS.",
    },
    methodSteps: {
      "zh-CN": ["首屏明确产品与适用人群", "提前解决价格、信任和选择阻力", "用清晰 CTA 完成购买或注册"],
      en: ["Clarify product and audience above the fold", "Resolve price, trust, and choice friction", "Complete purchase or signup with a clear CTA"],
    },
    signals: /(电商|e.?commerce|shop|购物|订阅|saas|产品|startup|生成器|builder|平台|product)/i,
    priority: 40,
  },
] as const;

function normalizeCreator(name: string) {
  return name
    .normalize("NFKC")
    .trim()
    .replace(/^@(?=[a-z0-9_])/i, "")
    .toLowerCase();
}

function hashIdentity(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function matchesDefinition(
  definition: SkillDefinition,
  item: SkillCaseInput
) {
  if (item.category !== definition.category) {
    return false;
  }
  return definition.signals.test(
    [item.title, ...(item.tags ?? [])].join(" ")
  );
}

function groupCreators<T extends SkillCaseInput>(cases: T[]) {
  const grouped = new Map<
    string,
    { name: string; cases: T[] }
  >();

  for (const item of cases) {
    const identity = normalizeCreator(item.creator);
    if (!identity) {
      continue;
    }
    const existing = grouped.get(identity);
    if (existing) {
      existing.cases.push(item);
    } else {
      grouped.set(identity, {
        name: item.creator.replace(/^@(?=[a-z0-9_])/i, ""),
        cases: [item],
      });
    }
  }

  return grouped;
}

function overlapRatio<T extends SkillCaseInput>(a: T[], b: T[]) {
  const aSlugs = new Set(a.map((item) => item.slug));
  const bSlugs = new Set(b.map((item) => item.slug));
  const intersection = [...aSlugs].filter((slug) => bSlugs.has(slug)).length;
  const union = new Set([...aSlugs, ...bSlugs]).size;
  return union === 0 ? 0 : intersection / union;
}

const CJK_PATTERN = /[぀-ヿ㐀-䶿一-鿿]/;

function firstEvidenceSentence(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const sentence = normalized.split(/(?<=[。！？.!?])/)[0]?.trim() || normalized;
  return sentence.length > 150 ? `${sentence.slice(0, 149)}…` : sentence;
}

/**
 * 一条 Case 里可以当证据用的句子。
 *
 * 只认这条 Case 自己写过的三段式复盘：resultBreakdown，以及生成端标成
 * authored 的 promptContributionNotes（它就是 resultBreakdown 的本地化副本）。
 *
 * 明确排除按 category 拼出来的模板句。那种句子同一个 category 下每条 Case
 * 拿到的都一样，去重后只剩一句，看上去像「一条 Case 提供了一句证据」，
 * 实际上它跟这条 Case 没有任何关系——拼进 Skill 描述、盖掉人工 methodSteps、
 * 再渲染进用户下载的 SKILL.md，等于拿套话冒充证据。
 * card 档取数不带 resultBreakdown（见 src/lib/case-columns.ts），列表页上
 * 几乎每条 Case 都会落到模板句，所以这不是边角情况而是常态。
 */
function collectAuthoredEvidence(item: SkillCaseInput): string[] {
  return [
    ...(item.promptContributionNotesSource === "authored"
      ? item.promptContributionNotes ?? []
      : []),
    ...(item.resultBreakdown ?? []),
  ];
}

/**
 * 每个 Case 最多贡献一句。
 *
 * 一个 Case 的 resultBreakdown 本身就是三段，让它连贡三句的话，「这个动作在
 * N 个 Case 里反复出现」实际上只有一个 Case 撑着——那是无依据的断言。要求
 * 三步来自三个不同 Case，凑不满两个就整体退回定义模板（SKILL_DEFINITIONS 里
 * 人工写的 methodSteps），宁可少说也不乱说。
 *
 * en 下跳过含中日文的证据句：resultBreakdown 缺英文翻译时会回退原文，直接
 * 拼进英文描述会得到中英混排。全被跳过就退回英文模板，是正确的降级。
 */
function deriveEvidenceSteps<T extends SkillCaseInput>(
  cases: T[],
  fallback: string[],
  locale: Locale
): { steps: string[]; evidenceCases: T[] } {
  const seen = new Set<string>();
  const steps: string[] = [];
  const evidenceCases: T[] = [];
  for (const item of cases) {
    const evidence = collectAuthoredEvidence(item);
    for (const value of evidence) {
      const step = firstEvidenceSentence(value);
      const identity = step.toLocaleLowerCase();
      if (!step || seen.has(identity)) continue;
      if (locale === "en" && CJK_PATTERN.test(step)) continue;
      seen.add(identity);
      steps.push(step);
      evidenceCases.push(item);
      break;
    }
    if (steps.length === 3) break;
  }

  return steps.length >= 2
    ? { steps, evidenceCases }
    : { steps: fallback, evidenceCases: [] };
}

function deriveEvidenceDescription<T extends SkillCaseInput>(
  evidence: { steps: string[]; evidenceCases: T[] },
  fallbackDescription: string,
  locale: Locale,
  kind: "shared" | "creator_method",
  creatorName?: string
) {
  if (evidence.evidenceCases.length < 2) {
    return fallbackDescription;
  }

  const evidenceStep = evidence.steps[0];
  const isEnglish = locale === "en";
  const evidenceCaseCount = evidence.evidenceCases.length;
  const evidenceCreatorCount = new Set(
    evidence.evidenceCases.map((item) => normalizeCreator(item.creator))
  ).size;
  // 举例必须是真正贡献了证据句的那几条。按 cases 前两条取的话，排在前面
  // 但一句证据都没出的 Case 会被冒名顶上，描述里的句子和案例对不上。
  // en 下还要滤掉标题没英文翻译的（title 缺翻译会回退中文原文），
  // 一条都不剩就整段省掉举例——描述本身仍然成立。
  const exampleCases = evidence.evidenceCases.filter(
    (item) => !isEnglish || !CJK_PATTERN.test(item.title)
  );
  const exampleTitles = exampleCases
    .slice(0, 2)
    .map((item) => (isEnglish ? `“${item.title}”` : `「${item.title}」`))
    .join(isEnglish ? ", " : "、");

  // 措辞刻意不写「反复出现 / repeatedly」。evidenceStep 是**某一条** Case 写下的
  // 句子，我们只验证了「有 N 条 Case 各自留下了可核对的复盘」，没有验证这句话
  // 描述的动作在这 N 条里都出现过。把前者说成后者就是拿证据数量冒充证据内容。
  if (isEnglish) {
    const subject =
      kind === "creator_method" && creatorName
        ? `${creatorName}'s ${evidenceCaseCount} published cases`
        : `${evidenceCaseCount} published cases from ${evidenceCreatorCount} creators`;
    const move = `${subject} document how they built this, for example: ${evidenceStep}`;
    return exampleTitles ? `${move} Examples: ${exampleTitles}.` : move;
  }

  const subject =
    kind === "creator_method" && creatorName
      ? `${creatorName} 的 ${evidenceCaseCount} 个已发布 Case`
      : `${evidenceCreatorCount} 位作者的 ${evidenceCaseCount} 个已发布 Case`;
  const move = `${subject} 各自写下了可核对的做法，例如：${evidenceStep}`;
  return exampleTitles ? `${move}证据案例：${exampleTitles}。` : move;
}

export function deriveSkillCatalog<T extends SkillCaseInput>(
  cases: T[],
  locale: Locale = "zh-CN"
): SkillCatalog<T> {
  const sharedSkills = SKILL_DEFINITIONS.flatMap((definition) => {
    const matchingCases = cases.filter((item) =>
      matchesDefinition(definition, item)
    );
    const creators = groupCreators(matchingCases);

    if (
      matchingCases.length < SHARED_MIN_CASES ||
      creators.size < SHARED_MIN_CREATORS
    ) {
      return [];
    }

    const evidence = deriveEvidenceSteps(
      matchingCases,
      definition.methodSteps[locale],
      locale
    );
    return [
      {
        slug: definition.slug,
        baseSlug: definition.slug,
        kind: "shared" as const,
        title: definition.title[locale],
        description: deriveEvidenceDescription(
          evidence,
          definition.description[locale],
          locale,
          "shared"
        ),
        category: definition.category,
        // 真实证据不足两条时 deriveEvidenceSteps 直接返回 definition.methodSteps，
        // 这里赋的就是人工原文，不会被套话盖掉（这份文本最终会进用户下载的 SKILL.md）。
        methodSteps: evidence.steps,
        cases: matchingCases,
        creators: [...creators.values()]
          .map((creator) => ({
            name: creator.name,
            caseCount: creator.cases.length,
          }))
          .sort(
            (a, b) =>
              b.caseCount - a.caseCount || a.name.localeCompare(b.name)
          ),
        caseCount: matchingCases.length,
        creatorCount: creators.size,
        generalSkillSlug: null,
        latestExampleDate: pickLatestAuthorDate(matchingCases, locale),
      },
    ];
  }).sort(
    (a, b) =>
      b.caseCount - a.caseCount || a.title.localeCompare(b.title, locale)
  );

  const sharedByBaseSlug = new Map(
    sharedSkills.map((skill) => [skill.baseSlug, skill])
  );
  const allCreators = groupCreators(cases);
  const creatorMethods: DerivedSkill<T>[] = [];

  for (const [identity, creator] of allCreators) {
    const candidates = SKILL_DEFINITIONS.flatMap((definition) => {
      const matchingCases = creator.cases.filter((item) =>
        matchesDefinition(definition, item)
      );
      if (
        matchingCases.length < CREATOR_METHOD_MIN_CASES ||
        !sharedByBaseSlug.has(definition.slug)
      ) {
        return [];
      }
      return [{ definition, matchingCases }];
    }).sort(
      (a, b) =>
        b.definition.priority - a.definition.priority ||
        b.matchingCases.length - a.matchingCases.length
    );

    const selected: typeof candidates = [];
    for (const candidate of candidates) {
      if (
        selected.some(
          (existing) =>
            overlapRatio(existing.matchingCases, candidate.matchingCases) >=
            0.7
        )
      ) {
        continue;
      }
      selected.push(candidate);
      if (selected.length >= CREATOR_METHOD_LIMIT) {
        break;
      }
    }

    for (const { definition, matchingCases } of selected) {
      const baseTitle = definition.title[locale];
      const evidence = deriveEvidenceSteps(
        matchingCases,
        definition.methodSteps[locale],
        locale
      );
      creatorMethods.push({
        slug: `${definition.slug}-by-${hashIdentity(identity)}`,
        baseSlug: definition.slug,
        kind: "creator_method",
        title: `${creator.name} · ${baseTitle}`,
        description: deriveEvidenceDescription(
          evidence,
          locale === "en"
            ? `A recurring ${baseTitle.toLowerCase()} method derived from ${matchingCases.length} published cases by ${creator.name}.`
            : `从 ${creator.name} 的 ${matchingCases.length} 个已发布 Case 中归纳出的「${baseTitle}」方法。`,
          locale,
          "creator_method",
          creator.name
        ),
        category: definition.category,
        // 真实证据不足两条时 deriveEvidenceSteps 直接返回 definition.methodSteps，
        // 这里赋的就是人工原文，不会被套话盖掉（这份文本最终会进用户下载的 SKILL.md）。
        methodSteps: evidence.steps,
        cases: matchingCases,
        creators: [{ name: creator.name, caseCount: matchingCases.length }],
        caseCount: matchingCases.length,
        creatorCount: 1,
        generalSkillSlug: definition.slug,
        latestExampleDate: pickLatestAuthorDate(matchingCases, locale),
      });
    }
  }

  creatorMethods.sort(
    (a, b) =>
      b.caseCount - a.caseCount || a.title.localeCompare(b.title, locale)
  );

  return {
    sharedSkills,
    creatorMethods,
    allSkills: [...sharedSkills, ...creatorMethods],
  };
}

export function getCaseSkillLinks<T extends SkillCaseInput>(
  catalog: SkillCatalog<T>,
  caseSlug: string,
  includeCreatorMethods = false
): SkillLink[] {
  const definitionPriority = new Map(
    SKILL_DEFINITIONS.map((definition) => [
      definition.slug,
      definition.priority,
    ])
  );
  const candidates = [
    ...catalog.sharedSkills,
    ...(includeCreatorMethods ? catalog.creatorMethods : []),
  ].filter((skill) => skill.cases.some((item) => item.slug === caseSlug));

  return candidates
    .sort(
      (a, b) =>
        (b.kind === "creator_method" ? 1 : 0) -
          (a.kind === "creator_method" ? 1 : 0) ||
        (definitionPriority.get(b.baseSlug) ?? 0) -
          (definitionPriority.get(a.baseSlug) ?? 0) ||
        b.caseCount - a.caseCount
    )
    .slice(0, includeCreatorMethods ? 3 : MAX_CASE_SKILLS)
    .map(({ slug, title, kind }) => ({ slug, title, kind }));
}

export function getCreatorMethods<T extends SkillCaseInput>(
  catalog: SkillCatalog<T>,
  creatorName: string
) {
  const identity = normalizeCreator(creatorName);
  return catalog.creatorMethods.filter(
    (skill) =>
      skill.creators[0] &&
      normalizeCreator(skill.creators[0].name) === identity
  );
}

export function findSkillBySlug<T extends SkillCaseInput>(
  catalog: SkillCatalog<T>,
  slug: string
) {
  return catalog.allSkills.find((skill) => skill.slug === slug) || null;
}

export function getSkillSearchFields<T extends SkillCaseInput>(
  skill: DerivedSkill<T>
): SearchField[] {
  return [
    { key: "title", value: skill.title, weight: 140 },
    { key: "description", value: skill.description, weight: 115 },
    { key: "creator", value: skill.creators.map((item) => item.name).join(" "), weight: 105 },
    { key: "method", value: skill.methodSteps.join(" "), weight: 100 },
    { key: "category", value: skill.category, weight: 70 },
    { key: "case", value: skill.cases.map((item) => item.title).join(" "), weight: 88 },
    { key: "tag", value: skill.cases.flatMap((item) => item.tags ?? []).join(" "), weight: 72 },
    { key: "prompt", value: skill.cases.map((item) => item.promptPreview ?? "").join(" "), weight: 52 },
    { key: "prompt", value: skill.cases.map((item) => item.promptFull ?? "").join(" "), weight: 30 },
  ];
}

/**
 * /skills 页面搜索：Skill 自身的标题/描述之外，也搜方法步骤、作者和证据 Case。
 * 用户通常记得的是「角色一致性」「Vlog」或某个作者/Prompt 里的词，不一定记得
 * 我们给 Skill 起的标题；只搜 Skill 名称会让这些真实证据无法被发现。
 */
export function filterSkillsByQuery<T extends SkillCaseInput>(
  list: DerivedSkill<T>[],
  q: string
): DerivedSkill<T>[] {
  return rankSearchResults(list, q, getSkillSearchFields).map(({ item }) => item);
}
