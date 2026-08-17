import { getImageProps } from "next/image";

/**
 * <video poster> 是原生 HTML 属性，next/image 只自动包办 <img>，不碰它——
 * 结果是全站图片走上 /_next/image 同源代理之后，视频封面仍在直连第三方图床
 * （国内访客抓不到 twimg 上的封面）。这里用 getImageProps 手工换成同一个
 * 代理地址，补上这个缺口。
 *
 * 为什么是 getImageProps 而不是自己拼 /_next/image?url=... 或读 env：
 * 部分调用方（case-card / case-media）是 client 组件，浏览器里读不到
 * GOODCASE_OPTIMIZE_IMAGES，手查 env 会让 server/client 各说各话造成
 * hydration 撕裂。getImageProps 的配置（unoptimized 开关、宽度档位）由
 * next/image 在构建期注入两端 bundle，两边输出必然一致；开关关着时原样
 * 返回原 URL，行为跟 <Image> 组件完全对齐。
 *
 * 额度：视频封面量级几百张 × 1-2 个宽度档，在已估算的转换额度富余内。
 */
export function optimizedPosterUrl(
  posterUrl: string | undefined,
  /** 卡片/小格位用 640，详情页整宽播放器用 1080（必须是配置里的宽度档）。 */
  width: 640 | 1080 = 640
): string | undefined {
  if (!posterUrl) return undefined;
  const { props } = getImageProps({
    src: posterUrl,
    alt: "",
    width,
    // 高度只参与组件侧的宽高比计算，不进 URL；封面统一按 16:9 报即可。
    height: Math.round((width * 9) / 16),
  });
  return props.src;
}
