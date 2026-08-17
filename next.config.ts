import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
];

/**
 * 这三个列表页读了 searchParams（筛选、搜索、翻页），Next 因此只能在请求时渲染，
 * 页里的 revalidate + generateStaticParams 一行都不起作用。实测线上它们每次访问
 * 都是 x-vercel-cache: MISS、cache-control: private, no-cache, no-store —— 边缘
 * 一次都没缓存过，大陆用户每次进案例库都要吃一整趟回源。
 *
 * 让它们回到构建期预渲染需要把 searchParams 挪进客户端组件，那是重构。这里用
 * Vercel 支持的 targeted cache header 兜住：CDN-Cache-Control 优先级高于函数
 * 自己返回的 Cache-Control，只作用于 CDN，不影响浏览器——浏览器拿到的仍然是
 * Next 那份 no-store，照旧每次向边缘要新的。
 *
 * TTL 敢给到一天，前提和站内 ISR 页一样：内容只随部署变，而 Vercel 的 CDN 缓存
 * 按部署隔离，发布触发 Deploy Hook 出新部署，缓存键随之全部换新，不会留陈内容。
 *
 * 三个页面对所有访客渲染结果相同，不读 cookie、不带鉴权，缓存在共享 CDN 上是安全的。
 * 注意这里必须逐条点名路径：/operator/* 是登录态页面，/api/* 有自己的缓存口径，
 * 任何一条写成 /:path* 的通配都会把它们一起缓存掉。
 */
const CACHEABLE_LIST_PATHS = ["/cases", "/skills", "/creators"];

const LIST_PAGE_CDN_CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

/**
 * 同时覆盖对外路径和 proxy.ts 内部重写后的路径：中文站 /cases 会被重写成
 * /zh-CN/cases，headers 匹配发生在路由层，两种形态都列上才不依赖匹配时机。
 * （/zh-CN/* 对外会被 308 收敛回无前缀，用户不会直接请求到它。）
 */
const listPageCacheHeaders = CACHEABLE_LIST_PATHS.flatMap((path) =>
  ["", "/en", "/zh-CN"].map((prefix) => ({
    source: `${prefix}${path}`,
    headers: [
      {
        key: "CDN-Cache-Control",
        value: LIST_PAGE_CDN_CACHE_CONTROL,
      },
    ],
  }))
);

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    // Turbopack 靠向上找 lockfile 推断 workspace root。开发机的上级目录（含主目录）
    // 若存在无关的 package-lock.json，root 会被推断到仓库外：模块解析范围放大，
    // 报错路径也变成相对那个目录的形式。钉到配置文件所在目录（即仓库根），
    // 结果不再取决于开发机上仓库之外的文件。
    // 注意：改完本文件要 rm -rf .next 再验，脏缓存会报出误导性的解析错误。
    root: import.meta.dirname,
  },
  experimental: {
    globalNotFound: true,
  },
  images: {
    // 数据库中的 media_url / poster_url 可能是任意 https 外链（当前主要是本地 /media/），
    // 放开 https 通配以免运行时因未知域名报错；本地路径不受影响。
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Vercel Hobby 每月只含 5000 次图片转换，且每张图的每个宽度各算一次。
    // 案例列表一页三百多张图，刷几次就打满，之后 /_next/image 全站返回
    // 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED，缩略图变黑块。
    // 因此默认不走优化、直出原图；升级套餐或改用自建缩略图后，
    // 设 GOODCASE_OPTIMIZE_IMAGES=1 即可恢复优化。
    unoptimized: process.env.GOODCASE_OPTIMIZE_IMAGES !== "1",
    // 恢复优化时也要控制变体数量：宽度档位越少，转换次数越省。
    deviceSizes: [640, 1080, 1920],
    imageSizes: [128, 256],
    // 变体缓存放长到 31 天：Vercel 对每次 cache MISS/STALE 重新转换并计费，
    // 案例媒体一经发布内容不变（改图会换 URL），短 TTL 只会白烧转换次数。
    minimumCacheTTL: 2_678_400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // 放在通配之后：同 key 时后面的覆盖前面的，而这里两组 key 不重叠，
      // 顺序只影响可读性。缓存口径单独一组，方便一眼看清哪些路径被放宽了。
      ...listPageCacheHeaders,
    ];
  },
};

export default nextConfig;
