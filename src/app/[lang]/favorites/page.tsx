import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social-metadata";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { FavoritesList } from "@/components/favorites-list";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getLocaleFromParams } from "@/i18n/server";
import { localeAlternates } from "@/lib/seo/alternates";

// 收藏数据全在浏览器 localStorage 里，服务端只渲染一个空壳，请求期不取任何数。
// 不枚举 [lang] 的话 Next 只能在请求时渲染，Vercel 对这类响应下发 private/no-store，
// 边缘永远 MISS。枚举之后它变成构建期静态页，边缘直接命中。
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

type PageParams = Promise<{ lang: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  const title = isEnglish ? "My Favorites" : "我的收藏 · 好案例";
  const description = isEnglish
    ? "Cases you save on GoodCase.ai stay in this browser and require no account."
    : "你在 GoodCase.ai 收藏的 AI 案例都在这里，收藏保存在本机浏览器，免登录即可使用。";

  return {
    title,
    description,
    ...socialMetadata({ locale, title, description, path: "/favorites" }),
    alternates: localeAlternates(locale, "/favorites"),
    // 收藏内容全部来自 localStorage，爬虫抓到的是空壳，属于薄内容——
    // follow 保持开，页面上的其它站内链接仍然值得被继续抓取。
    robots: { index: false, follow: true },
  };
}

export default async function FavoritesPage({
  params,
}: {
  params: PageParams;
}) {
  const locale = await getLocaleFromParams(params);
  const isEnglish = locale === "en";
  return (
    <SiteShell
      footerNote={
        isEnglish
          ? "Favorites stay in your browser. No login and no uploaded personal shelf."
          : "收藏保存在本机浏览器，不要求登录，也不会上传个人书架。"
      }
    >
      <PageHero
        eyebrow={isEnglish ? "Favorites · Local shelf" : "收藏 · 本地书架"}
        title={
          isEnglish
            ? "Keep the cases worth revisiting close."
            : "把值得复看的 Case 留在手边。"
        }
        description={
          isEnglish
            ? "Favorites are a personal workspace, not another content library. Every saved item still resolves to the same case, creator, prompt, and retest record."
            : "收藏只是个人工作台，不生成另一套内容。每条收藏仍然回到同一个 Case、作者、Prompt 和复测记录。"
        }
      />

      <div className="py-7">
        <FavoritesList />
      </div>
    </SiteShell>
  );
}
