/**
 * JSON-LD schema 构造集中地。全部是纯函数：只接收页面已经取好的数据，
 * 不 import 任何 server-only 数据层（Supabase client、cache() 包裹的
 * 取数函数等），保证这个模块本身可以被任意 Server/Client 边界安全引用。
 *
 * 统一约定：
 * - 所有绝对地址都走 `absoluteUrl()` / `localizeHref()`，不手工拼字符串。
 * - 可能为空的字段一律「有值才输出 key」，不通过展开 undefined 输出
 *   `null` / `undefined`——schema 校验器会把这些当成格式错误。
 * - 不输出 `interactionStatistic` / `aggregateRating` 之类基于原帖快照的
 *   互动数字：那是来源贴的历史快照，挂到本站页面上等同于对本站流量做
 *   虚假互动声明。
 */

import { localizeHref, type Locale } from "@/i18n/config";
import { MISSING_MODEL } from "@/lib/related-cases";
import { absoluteUrl } from "@/lib/site";
import type { CaseCategory } from "@/lib/mock-data";

const SITE_NAME = "GoodCase.ai";

type JsonLdNode = Record<string, unknown>;

/** 省略 undefined / null / 空数组字段，避免结构化数据里出现空壳 key。 */
function withOptional<T extends JsonLdNode>(base: T, optional: JsonLdNode): T {
  const result: JsonLdNode = { ...base };
  for (const [key, value] of Object.entries(optional)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key] = value;
  }
  return result as T;
}

/**
 * 站点级 WebSite schema，注入 `[lang]/layout.tsx`。
 *
 * SearchAction 的 target 指向 /cases 的 `q` 参数——参数名来自
 * `src/components/search-box.tsx` 的 `<input name="q">` 与
 * `src/app/[lang]/cases/page.tsx` 的 `searchParams.q`，两处均已核对，
 * 不是猜的。
 */
export function buildWebSiteSchema(locale: Locale, description: string): JsonLdNode {
  const siteUrl = absoluteUrl(localizeHref(locale, "/"));
  const searchTemplate = absoluteUrl(
    localizeHref(locale, "/cases?q={search_term_string}")
  );

  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: locale,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 站点级 Organization schema。`sameAs` 只收仓库里真实存在的官方外链
 * （`src/app/[lang]/connect/page.tsx` 的 LearnPrompt 外链、
 * `src/lib/installable-skills.ts` / `llms.txt` 里的 GitHub 仓库地址），
 * 不编造社交账号。
 */
export function buildOrganizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/goodcase-mark.svg"),
    sameAs: [
      "https://github.com/LearnPrompt/goodcase-lite",
      "https://www.learnprompt.pro",
    ],
  };
}

/** BreadcrumbList；items 由页面按自己的导航层级传入，本函数只负责拼 URL。 */
export function buildBreadcrumbSchema(
  locale: Locale,
  items: Array<{ name: string; path: string }>
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizeHref(locale, item.path)),
    })),
  };
}

type CaseSchemaInput = {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  category: CaseCategory;
  mediaUrl: string;
  posterUrl?: string;
  sourcePublishedAt?: string;
  tags?: string[];
  creatorName: string;
  /** 只有能解析出作者详情页时才传，author.url 因此是「有才输出」。 */
  creatorSlug?: string;
  sourceUrl?: string;
  recommendedModels: string[];
  promptFull: string;
};

/**
 * 案例详情页 `cases/[slug]` 的核心 schema。
 *
 * @type 按 category 单选：image → ImageObject、video → VideoObject、
 * 其余 → CreativeWork。ImageObject / VideoObject 在 schema.org 里都是
 * CreativeWork 的子类型，所以 author / keywords / isBasedOn / text 这些
 * CreativeWork 字段可以直接挂在同一层，不需要额外拼 @type 数组。
 *
 * 刻意不输出 aggregateRating / interactionStatistic：sourceLikeCount 是
 * 原帖点赞数的快照，不是本站互动数据，挂上去等于对本站页面做虚假互动声明。
 */
export function buildCaseSchema(input: CaseSchemaInput): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, `/cases/${input.slug}`));
  const mediaAbsolute = absoluteUrl(input.mediaUrl);
  const posterAbsolute = input.posterUrl
    ? absoluteUrl(input.posterUrl)
    : undefined;
  const imageAbsolute = posterAbsolute ?? mediaAbsolute;

  const primaryType =
    input.category === "image"
      ? "ImageObject"
      : input.category === "video"
        ? "VideoObject"
        : "CreativeWork";

  const models = input.recommendedModels.filter(
    (model) => model !== MISSING_MODEL
  );

  const base: JsonLdNode = {
    "@type": primaryType,
    name: input.title,
    description: input.description,
    url,
    inLanguage: input.locale,
    image: imageAbsolute,
    author: withOptional(
      { "@type": "Person", name: input.creatorName },
      {
        url: input.creatorSlug
          ? absoluteUrl(
              localizeHref(input.locale, `/creators/${input.creatorSlug}`)
            )
          : undefined,
      }
    ),
    text: input.promptFull,
  };

  return withOptional(base, {
    // VideoObject 必须显式给出 thumbnailUrl 和 contentUrl，是 Google 的
    // 硬性字段要求，不满足这两个字段结构化数据测试工具会直接判无效。
    thumbnailUrl: primaryType === "VideoObject" ? imageAbsolute : undefined,
    contentUrl: primaryType === "VideoObject" ? mediaAbsolute : undefined,
    datePublished: input.sourcePublishedAt,
    keywords: input.tags,
    isBasedOn: input.sourceUrl,
    citation: input.sourceUrl,
    about: models.length
      ? models.map((name) => ({ "@type": "Thing", name }))
      : undefined,
    // `text` 字段旁边补一个可深链的锚点：完整 Prompt 正文渲染在
    // `src/components/prompt-panel.tsx` 里 `id="prompt"` 的 <article> 上
    // （对应 `cases/[slug]/page.tsx` 里挂载 <PromptPanel> 的位置），
    // hasPart 是 CreativeWork 上正式存在的字段——"这份创作物包含的一个
    // 组成部分"，语义上比硬套 mainEntityOfPage（那个是反过来，页面→主实体）
    // 更贴切，所以选它而不是 mainEntityOfPage。
    hasPart: input.promptFull?.trim()
      ? { "@type": "CreativeWork", name: "Prompt", url: `${url}#prompt` }
      : undefined,
  });
}

type CreatorSchemaInput = {
  locale: Locale;
  slug: string;
  name: string;
  avatarUrl?: string;
  bio: string;
};

/** 创作者详情页 `creators/[slug]`：ProfilePage + mainEntity: Person。 */
export function buildCreatorSchema(input: CreatorSchemaInput): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, `/creators/${input.slug}`));

  return {
    "@type": "ProfilePage",
    url,
    inLanguage: input.locale,
    mainEntity: withOptional(
      {
        "@type": "Person",
        name: input.name,
        url,
        description: input.bio,
      },
      { image: input.avatarUrl ? absoluteUrl(input.avatarUrl) : undefined }
    ),
  };
}

/** 通用「当页条目」列表 schema，/cases、/creators、/skills、/daily/[date] 等列表页共用。 */
export function buildCollectionListSchema(input: {
  locale: Locale;
  path: string;
  name: string;
  items: Array<{ name?: string; url: string }>;
}): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, input.path));

  return {
    "@type": "CollectionPage",
    url,
    name: input.name,
    inLanguage: input.locale,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) =>
        withOptional(
          {
            "@type": "ListItem",
            position: index + 1,
            url: item.url,
          },
          { name: item.name }
        )
      ),
    },
  };
}

/**
 * 模型详情页 `models/[slug]`：CollectionPage + ItemList。
 *
 * `totalCount` 传该模型下的真实案例总数，`itemUrls` 只传当页实际渲染出的
 * 那些（模型页只展示前 N 条，其余引流到 /cases?model=），两者允许不相等。
 */
export function buildModelCollectionSchema(input: {
  locale: Locale;
  slug: string;
  label: string;
  itemUrls: string[];
  totalCount: number;
}): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, `/models/${input.slug}`));

  return {
    "@type": "CollectionPage",
    url,
    name: input.label,
    inLanguage: input.locale,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.totalCount,
      itemListElement: input.itemUrls.map((itemUrl, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: itemUrl,
      })),
    },
  };
}

type WebApiSchemaInput = {
  locale: Locale;
  name: string;
  description: string;
};

/**
 * `/agent-api` 页的 WebAPI schema，告诉抓取方这是一个可调用的公开接口，
 * 不只是一篇说明文档。
 *
 * `provider` 直接内嵌 `buildOrganizationSchema()` 的完整对象（跟
 * `buildCaseSchema` 里 `author` 的写法一致）——这个仓库里没有建立 `@id`
 * 互相引用的约定，内嵌对象是唯一已验证可行的关联方式。
 *
 * `termsOfService` 故意不输出：仓库里没有独立的服务条款页（已 grep 确认），
 * 编一个不存在的 URL 比不写这个字段更糟。
 *
 * `potentialAction` 的 target 指向 `/api/public/cases`，参数名 `q` 已对照
 * `src/app/api/public/cases/route.ts` 核实（第 76 行 `searchParams.get("q")`），
 * 不是猜的。
 */
export function buildWebApiSchema(input: WebApiSchemaInput): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, "/agent-api"));
  const searchTemplate = `${absoluteUrl("/api/public/cases")}?q={search_term_string}`;

  return {
    "@type": "WebAPI",
    name: input.name,
    description: input.description,
    url,
    documentation: url,
    provider: buildOrganizationSchema(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type CaseDatasetSchemaInput = {
  locale: Locale;
  name: string;
  description: string;
};

/**
 * 描述「案例数据」本身的 Dataset schema，与 `buildWebApiSchema` 配套注入
 * `/agent-api` 页，两者同属一个 `@graph`（跟 layout.tsx 里 WebSite +
 * Organization 同图不建 `@id` 互链是同一种写法）。
 *
 * `distribution` 两条分别指向增量查询端点和全量快照文件，本身就把
 * "这个数据集从哪儿拿" 说清楚了，不需要另外发明一个 schema.org 里
 * 不存在的字段去正式建立 WebAPI → Dataset 的链接。
 *
 * 刻意不输出 `license`：repo 根目录没有 LICENSE 文件，`package.json` 也没有
 * `license` 字段，README 里也没有许可声明（均已核实），没有可引用的依据。
 */
export function buildCaseDatasetSchema(input: CaseDatasetSchemaInput): JsonLdNode {
  return {
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    creator: buildOrganizationSchema(),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: absoluteUrl("/api/public/cases"),
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/plain",
        contentUrl: absoluteUrl(localizeHref(input.locale, "/llms-full.txt")),
      },
    ],
  };
}

type SkillSchemaInput = {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  cases: Array<{ title: string; slug: string }>;
};

/** Skill 详情页：在既有 LearningResource 字段基础上补齐，不退化已有字段。 */
export function buildSkillSchema(input: SkillSchemaInput): JsonLdNode {
  const url = absoluteUrl(localizeHref(input.locale, `/skills/${input.slug}`));

  return {
    "@type": "LearningResource",
    name: input.title,
    description: input.description,
    url,
    inLanguage: input.locale,
    isBasedOn: input.cases.map((item) => ({
      "@type": "CreativeWork",
      name: item.title,
      url: absoluteUrl(localizeHref(input.locale, `/cases/${item.slug}`)),
    })),
  };
}
