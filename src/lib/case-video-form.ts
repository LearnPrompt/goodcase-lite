/**
 * AI 视频案例的「生成形式」二级筛选。
 *
 * 视频案例实际分两种玩法：只给文字描述直接出片，和带参考素材出片
 * （首帧图、角色参考图、产品图、参考视频、参考音频都算）。这两类的可复现门槛
 * 完全不同——参考生的那批，别人没有同一张素材就复刻不出来——所以值得在
 * /cases 里单独筛。
 *
 * 载体用已有的 tags 列，不加数据库列。取值沿用库里机器标签那一族的写法
 * （human-reviewed / workflow-method / not-rerun / source-comfy 都是小写连字符），
 * 这两个标签同样是给筛选逻辑读的机器标记，不是给人看的话题标签。
 * 顺带一个好处：标签值本身就能直接当 URL 参数值，不用再维护一张映射表，
 * 也不会在链接里出现一长串百分号转义。
 */

/** 纯文本生成：提示语之外没有任何输入素材。 */
export const VIDEO_FORM_TAG_TEXT = "text-to-video";

/** 参考素材生成：首帧图、角色/产品参考图、参考视频、参考音频等任意一种。 */
export const VIDEO_FORM_TAG_REF = "ref-to-video";

export type VideoForm = "all" | typeof VIDEO_FORM_TAG_TEXT | typeof VIDEO_FORM_TAG_REF;

/** 默认值不写进 URL，避免同一份内容出现两个地址（也就是两个 CDN 缓存键）。 */
export const DEFAULT_VIDEO_FORM: VideoForm = "all";

/** 未知取值一律兜底成「全部」，不让脏参数筛出空列表。 */
export function normalizeVideoForm(value?: string | null): VideoForm {
  return value === VIDEO_FORM_TAG_TEXT || value === VIDEO_FORM_TAG_REF
    ? value
    : DEFAULT_VIDEO_FORM;
}

type VideoFormFilterable = {
  category: string;
  tags?: string[] | null;
};

/**
 * 只有主筛选停在 video 上时二级筛选才生效；其它分类下这个参数被直接忽略，
 * 而不是筛出空结果。判断放在这里而不是调用方，是为了让「非 video 时忽略」
 * 这条规则本身可以被纯函数测试覆盖。
 *
 * 没打标签的存量案例只会出现在「全部」里。这是数据完备性的欠账，不是筛选的 bug：
 * 与其猜一个默认归类把它们塞进某一边，不如让子筛选只对已判定过的案例负责。
 */
export function filterCasesByVideoForm<T extends VideoFormFilterable>(
  list: T[],
  category: string,
  form: VideoForm
): T[] {
  if (category !== "video" || form === "all") {
    return list;
  }

  return list.filter((item) => item.tags?.includes(form));
}
