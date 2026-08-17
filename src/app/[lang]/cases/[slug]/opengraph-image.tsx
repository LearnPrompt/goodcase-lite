import { ImageResponse } from "next/og";
import { getCaseDetailData } from "@/lib/cases";
import { normalizeLocale } from "@/i18n/config";
import { loadChineseFont } from "@/lib/og-font";
import { loadCaseOgMedia } from "@/lib/og-media";
import { SITE_HOST } from "@/lib/site";

// 内容只在运营发布时变，发布会触发部署重新生成；这里当兜底，一小时一次足够。
export const revalidate = 3_600;

export const alt = "GoodCase.ai case";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * 案例分享卡。
 *
 * 为什么不直接把案例原图当 og:image：og 卡是 1.91:1 的横图，而案例媒体
 * 大多是 3:4 或 9:16 的竖图，X / Telegram 一律居中裁成一条横带，出来是
 * 主体腰部那一截，既看不清作品也不带品牌。所以这里把作品缩略图**合成进**
 * 1200×630 的卡里：右侧一栏放作品，左侧放标题、分类和站点标识，比例可控。
 *
 * 拿不到作品图（无缩略图、读取失败）时退回原来的纯文字卡，不会开天窗。
 */

const MEDIA_PANEL_WIDTH = 460;
const TEXT_COLUMN_WIDTH = size.width - MEDIA_PANEL_WIDTH;

const CATEGORY_LABELS: Record<string, string> = {
  image: "AI 图像",
  video: "AI 视频",
  web: "AI 编程(UI)",
  copy: "AI 文案",
  hardware: "AI 硬件",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  image: "AI IMAGE",
  video: "AI VIDEO",
  web: "AI CODING (UI)",
  copy: "AI COPY",
  hardware: "AI HARDWARE",
};

const FOOTNOTE_ZH = "完整 Prompt 公开";
const FOOTNOTE_EN = "Full prompt is public";

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = normalizeLocale(lang);
  const isEnglish = locale === "en";
  const [item, media] = await Promise.all([
    getCaseDetailData(slug, locale),
    loadCaseOgMedia(slug),
  ]);

  const title = item?.title || (isEnglish ? "GoodCase.ai case" : "GoodCase.ai 案例");
  const categoryKey = item?.category || "image";

  // 卡上出现的中文字必须全部进字体子集，漏一个就渲染成空白。
  // 之前只传了标题和分类，页脚那句「完整 Prompt 公开」的字形一直是缺的。
  const fontData = isEnglish
    ? null
    : await loadChineseFont(
        `${title}${CATEGORY_LABELS[categoryKey]}${FOOTNOTE_ZH}`
      );

  const useChinese = !isEnglish && Boolean(fontData);
  const displayTitle = isEnglish || useChinese ? title : slug.replace(/-/g, " ");
  const displayCategory = useChinese
    ? CATEGORY_LABELS[categoryKey]
    : CATEGORY_LABELS_EN[categoryKey];
  const footnote = useChinese ? FOOTNOTE_ZH : FOOTNOTE_EN;

  const textColumnWidth = media ? TEXT_COLUMN_WIDTH : size.width;
  const titleFontSize = media
    ? displayTitle.length > 16
      ? "48px"
      : "62px"
    : displayTitle.length > 18
      ? "60px"
      : "76px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0a0a",
          fontFamily: useChinese ? "Noto Sans SC" : "sans-serif",
        }}
      >
        <div
          style={{
            width: `${textColumnWidth}px`,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px 64px 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  backgroundColor: "#c2410c",
                }}
              />
              <div
                style={{
                  fontSize: "30px",
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
                display: "flex",
                border: "2px solid #c2410c",
                color: "#c2410c",
                fontSize: "22px",
                padding: "8px 20px",
                letterSpacing: "0.08em",
              }}
            >
              {displayCategory}
            </div>
          </div>

          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 500,
              lineHeight: 1.15,
              color: "#fafaf7",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              borderTop: "1px solid #333330",
              paddingTop: "28px",
            }}
          >
            <div style={{ fontSize: "24px", color: "#a3a39e", display: "flex" }}>
              {footnote}
            </div>
            <div style={{ fontSize: "24px", color: "#6b6b66" }}>{SITE_HOST}</div>
          </div>
        </div>

        {media ? (
          <div
            style={{
              width: `${MEDIA_PANEL_WIDTH}px`,
              height: "100%",
              display: "flex",
              overflow: "hidden",
              borderLeft: "1px solid #333330",
              backgroundColor: "#141412",
            }}
          >
            {/* satori 只认原生 img，这里不是页面 DOM，不能用 next/image */}
            <img
              src={media.dataUri}
              alt=""
              width={MEDIA_PANEL_WIDTH}
              height={size.height}
              style={{
                width: `${MEDIA_PANEL_WIDTH}px`,
                height: `${size.height}px`,
                objectFit: "cover",
              }}
            />
          </div>
        ) : null}
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
