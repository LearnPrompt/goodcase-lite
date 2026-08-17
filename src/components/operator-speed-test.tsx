"use client";

import { useCallback, useState } from "react";

/**
 * 运营测速：点按钮才跑，不做定时任务。
 *
 * 口径说明（为什么不是 Lighthouse / iframe）：
 * - 全站 CSP `frame-ancestors 'none'` + X-Frame-Options DENY，iframe 加载
 *   自家页面会被浏览器拒绝，「iframe onload 计完整加载」这条路走不通；
 *   为一个内部工具放松防点击劫持不值得。
 * - 所以用同源 fetch 瀑布近似：先计 HTML 文档耗时，再解析出**急加载**媒体
 *   （非 lazy 的 img、head 里的 image preload、video poster）并发抓取计时。
 *   浏览器打开页面时并行下载这些资源，所以「近似完整打开」= HTML + 媒体
 *   并发耗时的最大值。不含 JS 执行与渲染，但媒体正是这个站的慢源。
 * - 跨域媒体（推特图床等）先按 cors 抓、失败退 no-cors（只计时拿不到字节
 *   数）、再失败标「抓取失败」——失败列直接可视化「这张图在当前网络到底
 *   打不打得开」，国内访客的 twimg 问题在这里一眼可见。
 * - fetch 用 cache: no-store 跳过浏览器缓存但不影响 CDN：反复点测的是
 *   「新访客每次真实要付的网络耗时」，不是本机缓存的自我安慰。
 */

const PATHS = [
  "/",
  "/cases",
  "/skills",
  "/connect",
  "/daily",
  "/creators",
  "/cases/seedance-25-diner-frozen-time-rewind",
] as const;

/** 单页急加载媒体最多抓这么多个，防止某页异常挂几十张急加载图把测速拖死。 */
const MAX_MEDIA_PER_PAGE = 12;

const STORAGE_KEY = "goodcase:operator-speed-last-run";

type MediaResult = {
  url: string;
  ms: number;
  kb: number | null;
  failed: boolean;
};

type PageResult = {
  path: string;
  htmlMs: number;
  htmlKb: number;
  vercelCache: string;
  mediaCount: number;
  lazyCount: number;
  mediaMaxMs: number;
  mediaKb: number;
  approxOpenMs: number;
  failedMedia: MediaResult[];
  error?: string;
};

type StoredRun = {
  finishedAt: string;
  results: PageResult[];
};

function collectEagerMediaUrls(html: string): {
  eager: string[];
  lazyCount: number;
} {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const urls = new Set<string>();

  for (const link of doc.querySelectorAll('link[rel="preload"][as="image"]')) {
    const href = link.getAttribute("href");
    if (href) urls.add(href);
  }
  let lazyCount = 0;
  for (const img of doc.querySelectorAll("img")) {
    if (img.getAttribute("loading") === "lazy") {
      lazyCount += 1;
      continue;
    }
    const src = img.getAttribute("src");
    if (src) urls.add(src);
  }
  // video 元素一进 DOM 就会去取 poster（preload=none 只挡视频本体），算急加载。
  for (const video of doc.querySelectorAll("video[poster]")) {
    const poster = video.getAttribute("poster");
    if (poster) urls.add(poster);
  }

  return { eager: [...urls].slice(0, MAX_MEDIA_PER_PAGE), lazyCount };
}

async function timeMedia(rawUrl: string): Promise<MediaResult> {
  const url = new URL(rawUrl, window.location.origin).toString();
  const start = performance.now();
  try {
    const response = await fetch(url, { cache: "no-store" });
    const bytes = (await response.arrayBuffer()).byteLength;
    return {
      url,
      ms: performance.now() - start,
      kb: Math.round(bytes / 1024),
      failed: !response.ok && response.type !== "opaque",
    };
  } catch {
    // cors 被拒时资源本身往往仍可达，退 no-cors 只计时。
    try {
      const retryStart = performance.now();
      await fetch(url, { cache: "no-store", mode: "no-cors" });
      return { url, ms: performance.now() - retryStart, kb: null, failed: false };
    } catch {
      return { url, ms: performance.now() - start, kb: null, failed: true };
    }
  }
}

async function timePage(path: string): Promise<PageResult> {
  const start = performance.now();
  let html: string;
  let vercelCache = "-";
  let htmlKb = 0;
  try {
    const response = await fetch(path, { cache: "no-store" });
    vercelCache = response.headers.get("x-vercel-cache") ?? "-";
    html = await response.text();
    htmlKb = Math.round(html.length / 1024);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return {
      path,
      htmlMs: performance.now() - start,
      htmlKb,
      vercelCache,
      mediaCount: 0,
      lazyCount: 0,
      mediaMaxMs: 0,
      mediaKb: 0,
      approxOpenMs: performance.now() - start,
      failedMedia: [],
      error: String(error),
    };
  }
  const htmlMs = performance.now() - start;

  const { eager, lazyCount } = collectEagerMediaUrls(html);
  const media = await Promise.all(eager.map(timeMedia));
  const mediaMaxMs = media.reduce((max, item) => Math.max(max, item.ms), 0);

  return {
    path,
    htmlMs,
    htmlKb,
    vercelCache,
    mediaCount: media.length,
    lazyCount,
    mediaMaxMs,
    mediaKb: media.reduce((sum, item) => sum + (item.kb ?? 0), 0),
    approxOpenMs: htmlMs + mediaMaxMs,
    failedMedia: media.filter((item) => item.failed),
  };
}

function formatMs(value: number) {
  return `${Math.round(value)}`;
}

export function OperatorSpeedTest() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<PageResult[]>([]);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [previous, setPrevious] = useState<StoredRun | null>(null);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    // 上次的基线在点击时才从 localStorage 读：SSR/hydration 阶段不碰
    // window，也不用在 effect 里同步 setState（lint 禁）。在覆写之前先取，
    // 本轮的对比列才是「对上一次」而不是「对自己」。
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrevious(JSON.parse(raw) as StoredRun);
    } catch {
      // 本地存的对比基线坏了就当没有，不影响本次测速。
    }
    const collected: PageResult[] = [];
    // 顺序测，避免页面间互抢带宽把数字搅浑。
    for (const path of PATHS) {
      setProgress(path);
      collected.push(await timePage(path));
      setResults([...collected]);
    }
    const stamp = new Date().toLocaleString("zh-CN", { hour12: false });
    setFinishedAt(stamp);
    setRunning(false);
    setProgress("");
    try {
      const stored: StoredRun = { finishedAt: stamp, results: collected };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // localStorage 不可用只丢对比基线，测速本身照常。
    }
  }, []);

  const previousByPath = new Map(
    (previous?.results ?? []).map((item) => [item.path, item])
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="gc-btn gc-btn-primary disabled:opacity-50"
        >
          {running ? `测速中… ${progress}` : "跑一轮测速"}
        </button>
        {finishedAt ? (
          <span className="font-mono text-[11px] text-[var(--mute)]">
            本轮完成于 {finishedAt}
          </span>
        ) : previous ? (
          <span className="font-mono text-[11px] text-[var(--mute)]">
            上次测速 {previous.finishedAt}（对比列基于它）
          </span>
        ) : null}
      </div>

      {results.length > 0 ? (
        <div className="mt-5 overflow-x-auto border border-[var(--hair)]">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-[var(--hair)] bg-[var(--paper-2)] text-left uppercase tracking-[0.06em] text-[var(--mute)]">
                <th className="px-3 py-2 font-normal">路径</th>
                <th className="px-3 py-2 text-right font-normal">HTML ms</th>
                <th className="px-3 py-2 text-right font-normal">首屏媒体 ms</th>
                <th className="px-3 py-2 text-right font-normal">≈完整打开 ms</th>
                <th className="px-3 py-2 text-right font-normal">对比上次</th>
                <th className="px-3 py-2 text-right font-normal">媒体 数/KB</th>
                <th className="px-3 py-2 text-right font-normal">CDN</th>
                <th className="px-3 py-2 text-right font-normal">失败</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => {
                const prev = previousByPath.get(row.path);
                const delta = prev ? row.approxOpenMs - prev.approxOpenMs : null;
                return (
                  <tr key={row.path} className="border-b border-[var(--hair)] last:border-b-0">
                    <td className="px-3 py-2">{row.path}</td>
                    <td className="px-3 py-2 text-right">{formatMs(row.htmlMs)}</td>
                    <td className="px-3 py-2 text-right">{formatMs(row.mediaMaxMs)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-[var(--ink)]">
                      {formatMs(row.approxOpenMs)}
                    </td>
                    <td className={`px-3 py-2 text-right ${
                      delta === null
                        ? "text-[var(--mute)]"
                        : delta <= 0
                          ? "text-[var(--ink)]"
                          : "text-[var(--orange)]"
                    }`}>
                      {delta === null ? "-" : `${delta > 0 ? "+" : ""}${formatMs(delta)}`}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.mediaCount}/{row.mediaKb}
                      {row.lazyCount > 0 ? (
                        <span className="text-[var(--mute)]"> (+{row.lazyCount} lazy)</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-right">{row.vercelCache}</td>
                    <td className={`px-3 py-2 text-right ${row.failedMedia.length > 0 || row.error ? "text-[var(--orange)]" : "text-[var(--mute)]"}`}>
                      {row.error ? "HTML!" : row.failedMedia.length || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {results.some((row) => row.failedMedia.length > 0) ? (
        <div className="mt-4 border border-[var(--hair)] bg-[var(--paper-2)] p-3 font-mono text-[10px] text-[var(--mute)]">
          <div className="mb-1 uppercase tracking-[0.06em]">抓取失败的媒体（当前网络不可达）</div>
          {results.flatMap((row) =>
            row.failedMedia.map((item) => (
              <div key={`${row.path}-${item.url}`} className="truncate">
                {row.path} ← {item.url}
              </div>
            ))
          )}
        </div>
      ) : null}

      <p className="mt-4 max-w-2xl text-xs leading-6 text-[var(--mute)]">
        口径：HTML 文档耗时 + 首屏急加载媒体（非 lazy 图、image preload、video
        poster）并发耗时的最大值，跳过浏览器缓存、不跳 CDN；不含 JS
        执行与渲染。「失败」列的媒体在你当前网络里抓不到——国内网络看到推特图床
        整列失败属于预期，正是要修的问题。
      </p>
    </div>
  );
}
