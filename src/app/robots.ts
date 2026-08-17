import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_HOST } from "@/lib/site";

/**
 * 这份 robots.txt 的定位不是"防爬虫"，是"引路"。GoodCase.ai 本身就是给 Agent /
 * AI 引擎当案例与 Prompt 库用的（见 /llms.txt、/llms-full.txt、/agent-api），
 * 被 AI 搜索/生成式引擎引用是这个项目的目标，不是需要防范的风险。所以这里显式
 * 点名放行一批 AI/生成式爬虫 UA，而不是只留一条通配 `*` 规则让它们自己猜。
 *
 * 每一组规则都必须能访问 `/api/public/`：llms.txt 教 Agent 调
 * `/api/public/cases`，而 ChatGPT-User、Claude-User 这类"用户触发的抓取"
 * 是遵守 robots.txt 的——如果只写一条 `Disallow: /api/`，等于我们自己把这个
 * GEO 入口堵死了。Allow 与 Disallow 的优先级按最长匹配路径决定（Google/Bing/
 * 百度等主流引擎的实现都是如此，不是数组书写顺序），`/api/public/` 比
 * `/api/` 更长更具体，所以能在 `Disallow: /api/` 之下被单独放行。
 */

const SHARED_DISALLOW = [
  "/api/",
  "/operator",
  "/en/operator",
  "/auth/",
  "/favorites",
  "/en/favorites",
];

const SHARED_ALLOW = ["/", "/api/public/"];

function rule(userAgent: string | string[]) {
  return {
    userAgent,
    allow: SHARED_ALLOW,
    disallow: SHARED_DISALLOW,
  };
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 未显式列出的爬虫走这条通配规则；同样放行 /api/public/，因为这是
      // 之前唯一的规则漏挡了这条路径的地方（历史 bug，这次一并修）。
      rule("*"),
      // 通用搜索引擎
      rule(["Googlebot", "Bingbot", "DuckDuckBot", "Applebot"]),
      // 中文搜索引擎
      rule([
        "Baiduspider",
        "Sogou web spider",
        "YisouSpider", // 神马 / 夸克
        "Bytespider", // 头条 / 抖音
        "360Spider",
      ]),
      // AI / 生成式引擎——这批是本项目的核心目标受众
      rule([
        "GPTBot",
        "OAI-SearchBot",
        "ChatGPT-User",
        "ClaudeBot",
        "Claude-User",
        "Claude-SearchBot",
        "anthropic-ai",
        "PerplexityBot",
        "Perplexity-User",
        "Google-Extended",
        "Applebot-Extended",
        "cohere-ai",
        "meta-externalagent",
        "Amazonbot",
      ]),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_HOST,
  };
}
