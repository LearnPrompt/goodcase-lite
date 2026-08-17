// OG 图中文字体加载：用 Google Fonts 的 text= 参数按需取字形子集（TTF），
// 只拉当前文案用到的字符，体积小、无需把字体文件放进仓库。
// 失败时返回 null，调用方降级为拉丁字符渲染。
export async function loadChineseFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500&text=${encodeURIComponent(text)}`;
    const cssResponse = await fetch(cssUrl, {
      headers: {
        // 旧 UA 让 Google Fonts 返回 TTF（satori 不支持 woff2）
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.100 Safari/534.30",
      },
    });

    if (!cssResponse.ok) {
      return null;
    }

    const css = await cssResponse.text();
    // satori 支持 ttf / otf / woff（不支持 woff2）；Node fetch 下 Google 可能返回 woff。
    const resource = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype|woff)'\)/
    );

    if (!resource) {
      return null;
    }

    const fontResponse = await fetch(resource[1]);
    if (!fontResponse.ok) {
      return null;
    }

    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}
