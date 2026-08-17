/**
 * Next 16 的动态段参数两种形态并存：构建期（generateStaticParams 供参）和
 * generateMetadata 拿到的是原文（如 "卡尔"），运行时按需渲染的页面组件拿到的
 * 却是百分号编码形态（"%E5%8D%A1%E5%B0%94"）。中文名创作者的 slug 因此在页面
 * 正文里永远查不到，notFound 还会被 ISR 钉一整天。两种形态都收敛到原文再查。
 * 编码形态必含 "%"，而 slugifyCreatorName 的产出不含 "%"，据此区分；
 * 恶意构造的非法编码（如 "%zz"）解不开就原样返回，走正常 404。
 */
export function decodeCreatorSlugParam(slug: string) {
  if (!slug.includes("%")) {
    return slug;
  }

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function normalizeCreatorIdentity(name: string) {
  return name
    .normalize("NFKC")
    .trim()
    .replace(/^@(?=[a-z0-9_])/i, "")
    .toLowerCase();
}

export function slugifyCreatorName(name: string) {
  const normalized = normalizeCreatorIdentity(name);
  const tokens: string[] = [];
  let needsSeparator = false;

  for (const character of normalized) {
    if (/[a-z0-9\u4e00-\u9fff]/.test(character)) {
      if (needsSeparator && tokens.length > 0 && tokens.at(-1) !== "-") {
        tokens.push("-");
      }
      tokens.push(character);
      needsSeparator = false;
      continue;
    }

    if (/[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(character)) {
      if (tokens.length > 0 && tokens.at(-1) !== "-") {
        tokens.push("-");
      }
      tokens.push(`u${character.codePointAt(0)?.toString(36)}`);
      needsSeparator = true;
      continue;
    }

    needsSeparator = true;
  }

  return tokens.join("").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
