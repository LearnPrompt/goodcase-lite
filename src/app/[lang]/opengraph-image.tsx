import { ImageResponse } from "next/og";
import { loadChineseFont } from "@/lib/og-font";
import { SITE_HOST } from "@/lib/site";
import { normalizeLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// 内容只在运营发布时变，发布会触发部署重新生成；这里当兜底，一小时一次足够。
export const revalidate = 3_600;

export const alt = "GoodCase.ai AI prompt case collection";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * 站点默认分享卡。全站除案例详情页外都用它（Next 的文件式 metadata 约定：
 * 本文件覆盖 [lang] 段及其所有子路由，除非子段自己也放了 opengraph-image）。
 *
 * 卡上的定位文案取自 i18n/messages.ts 的 site.tagline / site.description，
 * 不在这里另起口号——分享卡说的话必须和站内说的是同一句。
 */

/** description 常写成「tagline：展开说明」，卡上已经单独放了 tagline，去掉重复的前缀。 */
function subline(tagline: string, description: string) {
  const separator = description.slice(tagline.length, tagline.length + 1);
  if (description.startsWith(tagline) && (separator === "：" || separator === ":")) {
    return description.slice(tagline.length + 1).trim() || description;
  }
  return description;
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = normalizeLocale((await params).lang);
  const messages = getMessages(locale);
  const enMessages = getMessages("en");
  const isEnglish = locale === "en";

  const headline = messages.site.tagline;
  const detail = subline(headline, messages.site.description);

  // 中文字形按需子集下载，卡上出现的每个中文字都要在这串里，否则渲染成空格。
  const fontData = isEnglish
    ? null
    : await loadChineseFont(`${headline}${detail}`);

  // 中文字体没拉下来时整卡退回英文，避免出一张全是豆腐块的图。
  const useChinese = !isEnglish && Boolean(fontData);
  const displayHeadline = useChinese ? headline : enMessages.site.tagline;
  const displayDetail = useChinese
    ? detail
    : subline(enMessages.site.tagline, enMessages.site.description);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "72px 80px",
          fontFamily: useChinese ? "Noto Sans SC" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#c2410c",
              }}
            />
            <div
              style={{
                fontSize: "34px",
                fontWeight: 600,
                color: "#fafaf7",
                letterSpacing: "-0.01em",
              }}
            >
              GoodCase.ai
            </div>
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#6b6b66",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            Case / Creator / Evidence
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: displayHeadline.length > 22 ? "68px" : "84px",
              fontWeight: 500,
              lineHeight: 1.05,
              color: "#fafaf7",
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {displayHeadline}
          </div>
          <div
            style={{
              fontSize: "30px",
              lineHeight: 1.4,
              color: "#a3a39e",
              display: "flex",
              maxWidth: "960px",
            }}
          >
            {displayDetail}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "3px",
                backgroundColor: "#c2410c",
              }}
            />
            <div style={{ fontSize: "26px", color: "#6b6b66" }}>{SITE_HOST}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans SC",
              data: fontData,
              style: "normal",
              weight: 500,
            },
          ]
        : undefined,
    }
  );
}
