/**
 * 首页板块锚点。
 *
 * 顶部导航的「排行榜」不是一个独立页面，而是直接跳首页 § 02 那两个总榜，
 * 所以 id 只能有一处真相：两边各自写一遍字符串，改名的时候必然漏一边，
 * 表现出来就是导航点了没反应，还不报错。
 */
export const HOME_RANKINGS_ANCHOR = "rankings";

/**
 * 带前导 "/" 是有意的：localizeHref 只改写路径段，纯 "#xxx" 会被当成
 * 站外/同页链接原样放行，en 下就跳不回 /en 首页了。
 */
export const HOME_RANKINGS_HREF = `/#${HOME_RANKINGS_ANCHOR}`;
