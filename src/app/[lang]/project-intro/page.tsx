import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getLocaleFromParams } from "@/i18n/server";
import { localeAlternates } from "@/lib/seo/alternates";

// 页面自身没有可渲染内容，请求一到就 redirect() 到 /connect#about，
// 这里补 generateMetadata 只是让它跟仓库里其它页面一样有 alternates——
// redirect() 会在渲染前抛出，真实抓取到的永远是 /connect 那份 <head>，
// 这里的 metadata 更多是给「/app 下所有 page.tsx 都过 alternates 检查」
// 这条巡检兜底，不代表这个地址真的会被索引出内容。
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
  return {
    title: "GoodCase.ai",
    alternates: localeAlternates(locale, "/project-intro"),
  };
}

export default function ProjectIntroPage() {
  redirect("/connect#about");
}
