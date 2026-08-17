export type ChangelogEntry = {
  date: string;
  title: string;
  items: string[];
  tags?: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-08-13",
    title: "站点定位语更新为「AI提示语案例合集」",
    items: [
      "站点定位语从「中文 AI Case 证据库」更新为「AI提示语案例合集」，页头、页脚、首页样本标签、分享卡与订阅源同步；英文口径为 AI Prompt Case Collection。",
      "修复部分设备上页头导航中文发虚看不清的问题：等宽字体栈补上中文字体兜底，中文字形不再落到设备默认字体。",
      "页头副标题与导航文字从灰色改为黑色并加大字号，小屏与低分屏下更清楚。",
    ],
    tags: ["品牌", "体验"],
  },
  {
    date: "2026-08-13",
    title: "卡片图片恢复默认彩色，新增滚动进场动效",
    items: [
      "根据用户反馈：卡片图片不再默认黑白、悬停才现色，改回默认彩色直接可见，不用逐张鼠标划过去看。",
      "案例列表与首页深度 Case 区新增滚动进场动效：卡片随滚动位移淡入，替代此前的「灰度悬停还原」交互；开启系统「减弱动态效果」的设备不播放该动效。",
    ],
    tags: ["体验"],
  },
  {
    date: "2026-08-11",
    title: "图片、UI 与视频复测产物公开可看",
    items: [
      "Case 详情页新增独立复测证据区：同一段 Prompt 的生成图片和视频可直接查看，UI 同时提供桌面与手机截图，并可下载生成 HTML 源文件。",
      "复测产物醒目标注为「复测生成 · 非作者原作」；同一模型默认只展开最新结果，旧结果收进运行历史并标明第 1/3、2/3、3/3 次，避免误解成不同模型。",
      "旧 Codex 图片生成记录在展示层归入 GPT Image 2，原始运行标识和模型回执核验说明继续保留。",
      "公开模型、测试日期、最终分与两位 AI 裁判原始分；自动评分明确标作 AI 评分，模型身份无法由回执核验时也如实说明。",
      "首批公开 181 条复测记录，覆盖 87 条图片、89 条 UI 与 5 条 MiniMax H3 768p 视频记录，其中生成失败也保留为无产物证据。",
    ],
    tags: ["透明度", "数据"],
  },
  {
    date: "2026-08-09",
    title: "首页本周最热、早报归档与稳定度样本分",
    items: [
      "首页新增「本周最热」：近期原帖里互动最高的六条，副标题按真实数据窗口标注统计范围，同一作者最多占两席。",
      "早报支持往期回放：新增按月归档列表与前后翻页，28 期早报可逐日回看；历史期不显示当日复测块，复测证据只呈现当下这一份。",
      "导航重排：排行榜入口置首、可直达首页双榜单，早报移至最后；两个榜单底部新增「查看完整排行」直达案例页对应排序。",
      "搜索支持中英同义词：搜「千问」「可灵」「智谱」「即梦」等中文名可直接命中英文命名的案例，公开 API 同步生效。",
      "稳定度样本分（BETA）分批上线：首批 81 条图像类案例补充样本口径稳定分，与人工复测判定分开标注，其余分类陆续跟进。",
    ],
    tags: ["功能", "体验"],
  },
  {
    date: "2026-08-08",
    title: "大陆备用入口、全站提速与社交分享卡",
    items: [
      "新增大陆备用入口 goodcase.carlwow.com，与主站同源同内容；实测大陆多地可达性良好。",
      "边缘缓存全面调优：此前一半页面每次访问都回源重算，现已全部进入边缘缓存，冷访问首字节时间从约 2 秒降至 0.4 秒级。",
      "社交分享卡全站补齐：案例详情分享卡合成作品图，创作者与 Skill 页分享不再缺图；修复视频案例分享到微信会显示其他案例图片的问题。",
      "复测结果发布后自动触发站点更新，新判定数分钟内全站可见。",
    ],
    tags: ["体验", "基础设施"],
  },
  {
    date: "2026-08-07",
    title: "创作者与 Skill 显示作者侧最新时间",
    items: [
      "创作者卡片与主页显示「最近作品」时间，取其已发布案例里最新的来源发布时间。",
      "Skill 目录与详情页显示「最近例证」时间，取支撑案例里最新的来源发布时间。",
      "只展示作者侧时间：日期反映创作生态的活跃度，站方编辑动作不生成任何公开时间戳。",
    ],
    tags: ["体验", "透明度"],
  },
  {
    date: "2026-08-07",
    title: "每日早报与 Agent API 上线，复测实验室开跑",
    items: [
      "新增每日早报（/daily）：每天固定推两条——一条最近 14 天的新爆款、一条值得复习的旧案例，选择按日期确定，所有人同一天看到同一对；提供早报专属 RSS 订阅。",
      "Agent API 正式化（/agent-api）：公开 API 保持免密钥可用并新增速率说明，接入方可申请 API key 获得更高配额；每条案例的响应新增 provenance 字段，标明该提示语已核对过原帖。",
      "复测实验室开始运转：首批 10 条图像与网页类案例已用当前模型重新生成对照，催复测票数最高的案例排在最前。人工判定后结果将陆续展示。",
    ],
    tags: ["功能", "API"],
  },
  {
    date: "2026-08-07",
    title: "真机体验修复：手机图片直出彩色、投票全站可点",
    items: [
      "手机上图片不再永远是灰色：灰度转彩的悬停效果只保留给有鼠标的设备，触屏直接显示彩色。",
      "催复测投票在所有卡片上都能直接点了，不用再进详情页；投过的案例在任何页面都显示已投状态。",
      "修复提示语翻译切换：中文原文案例此前点英文翻译没有反应，现已正常，偏好会按界面语言分别记住。",
      "Skill 页的安装命令不再把手机页面横向撑出屏幕，命令可在框内左右滑动并完整复制。",
      "详情页的原帖点赞数改为与点赞、收藏按钮同规格的展示样式。",
    ],
    tags: ["体验", "移动端"],
  },
  {
    date: "2026-08-06",
    title: "视频播放全面自托管，卡片排版等高",
    items: [
      "全部案例的视频与封面迁移到站点自有存储，播放不再依赖第三方图床的可达性；加载失败时会明确提示并提供重试和原帖入口。",
      "32 条案例的提示语按原帖补全为完整版——此前部分长提示语被来源方截断，最长的一条从 253 字补到一万余字；对应的方法拆解同步重写。",
      "列表卡片同一行严格等高：标题、摘要、标签区高度固定，提示语块与统计行逐张对齐。",
      "稳定度待复测的案例显示当前催复测票数。",
    ],
    tags: ["体验", "数据"],
  },
  {
    date: "2026-08-05",
    title: "无账号点赞与催复测投票上线",
    items: [
      "点赞从本地假计数改为全站真实计数：无需注册，同一浏览器对同一案例只算一次，跨设备可见。",
      "稳定度缺测的案例可以投票催复测，票数公开累计。",
      "案例详情页并排展示原帖在来源平台的真实点赞数，明确标注为录入时快照，与站内计数互不混淆。",
      "公开 API 新增真实的 likedCount 与 retestVoteCount 字段，Agent 可获取站内互动数据。",
    ],
    tags: ["功能", "透明度"],
  },
  {
    date: "2026-08-05",
    title: "内容溯源治理：下架 33 条对不上原始出处的案例",
    items: [
      "对全部经聚合渠道入库的案例逐条核对原始出处，下架 33 条提示语与原帖对不上（疑似逆向重构或原帖并未公开提示语）的案例。",
      "两条案例换回作者的中文原文提示语，此前展示的英文版转为译文保留。",
      "入库管线新增三道溯源校验：保留来源方的逆向重构标记、带标记的候选不再自动进入待审、入库时自动比对提示语是否出自原帖。",
      "一条创意归属存在公开争议的案例在详情页加注了中性说明。",
    ],
    tags: ["数据", "透明度"],
  },
  {
    date: "2026-08-05",
    title: "全站提速与模型浏览上线正式站",
    items: [
      "案例、创作者、模型页全面提速：案例列表页体积从 4.5MB 降到约 180KB，创作者页从 1.1MB 降到约 97KB。",
      "模型浏览上线：按 Seedance、GPT Image 等模型家族筛选案例，首页新增模型条。",
      "中英双语全站可用，语言切换不再丢失当前页面。",
      "案例列表与创作者列表支持分页；卡片媒体按比例自适应展示，竖版视频与界面截图不再被裁切。",
    ],
    tags: ["体验", "功能"],
  },
  {
    date: "2026-07-28",
    title: "从 Case 派生作者方法与通用 Skill",
    items: [
      "Case 卡片上的作者署名现在可以直接进入创作者页，作者 Case 数按全部已发布作品统计。",
      "同类方法至少出现在 3 个 Case、覆盖 2 位作者后，才会形成跨作者通用 Skill。",
      "同一作者至少有 3 个 Case 重复出现同类做法，才会形成作者方法；来源热度不参与生成门槛。",
      "Skill 有独立可分享证据页，但不进入一级导航，也不成为新的投稿类型。",
    ],
    tags: ["功能", "透明度"],
  },
  {
    date: "2026-07-27",
    title: "运营数据和 Agent 入口补齐",
    items: [
      "内部运营页新增最近 30 天匿名访问、Case 行为、投稿、公开证据与隐藏历史数据总览。",
      "测试反馈会被明确标记并单独归档，不与真实用户建议混在一起。",
      "新增 /llms.txt 机器入口，Agent 可从一个地址发现公开 API、RSS、Skill 与证据使用规则。",
      "公开 API 和案例库补齐 AI 文案、AI 硬件分类的一致支持。",
    ],
    tags: ["运营", "开放"],
  },
  {
    date: "2026-07-25",
    title: "Agent 接入移到顶部，品牌图标统一",
    items: [
      "Agent 接入成为顶部橙色主按钮，并同步进入首页首屏，不再藏在页脚。",
      "更新日志与反馈移到顶部导航；页脚只保留品牌和当前页面说明，链接与普通文字不再混淆。",
      "浏览器 favicon、Apple 图标和站内大拇指标记统一；本地开发页不再显示 Next.js 开发标志。",
    ],
    tags: ["体验", "品牌"],
  },
  {
    date: "2026-07-23",
    title: "喜爱榜改为可追溯的来源互动榜",
    items: [
      "来源互动榜只读取原帖的点赞、评论、转发、收藏与采集时间，不再用静态喜爱分冒充用户偏好。",
      "互动量按“赞 + 2×评论 + 3×转发 + 4×收藏”计算；最终分由平台内互动百分位 60%、互动速度百分位 30% 和数据完整度 10% 组成。",
      "跨平台排名先在各平台内部归一；缺失字段保持为空，不按 0 惩罚。",
      "没有可核验互动快照的 Case 仍可公开，但不会进入来源互动榜。",
    ],
    tags: ["数据", "透明度"],
  },
  {
    date: "2026-07-11",
    title: "搜索、收藏、RSS、接入页、分享海报一起上线",
    items: [
      "案例库支持关键词搜索，输入模型名、玩法或关键词就能直接定位案例。",
      "喜欢的案例可以收藏了，收藏记录保存在本机浏览器，不需要注册账号。",
      "新增 RSS 订阅，地址是 /feed.xml，新案例上线会自动推送到你的阅读器。",
      "新增「接入」页，教你把好案例接进自己的 AI 助手，Skill、RSS、API 三种方式任选。",
      "每个案例都可以生成带二维码的分享海报，转发到群里或朋友圈一张图说清楚。",
    ],
    tags: ["功能"],
  },
  {
    date: "2026-07-10",
    title: "公开 API 和 Skill 上线",
    items: [
      "开放了免费的公开 API，匿名可用、不需要申请 key，两个端点分别拉案例列表和单个案例详情。",
      "发布了 goodcase Skill，装到 Claude 等 AI 助手里，对话中直接查案例、比模型。",
    ],
    tags: ["开放"],
  },
  {
    date: "2026-07-09",
    title: "看案例不用注册了",
    items: [
      "移除了登录墙，全站案例免注册直接看。",
      "完整 Prompt 与复测记录直接公开，点赞只作为本机兴趣标记。",
    ],
    tags: ["体验"],
  },
  {
    date: "2026-05-17",
    title: "好案例上线",
    items: [
      "首批 12 个真实 AI 案例上线，覆盖 AI 视频、AI 编程、AI 图像。",
      "每个案例从三个维度帮你判断值不值得复刻：传播榜看热度，喜爱榜看口碑，稳定榜看能不能稳定复现。",
    ],
    tags: ["发布"],
  },
  {
    date: "2026-07-11",
    title: "接下来",
    items: [
      "稳定分将逐步由 Lab 复测数据驱动，不再只靠人工标注。",
      "案例投稿入口即将开放，你复刻成功的好案例也能收录进来。",
    ],
    tags: ["规划"],
  },
];

export const CHANGELOG_EN: ChangelogEntry[] = [
  {
    date: "2026-08-13",
    title: "Site positioning updated to AI Prompt Case Collection",
    items: [
      "The site positioning changed from “AI Case Evidence Library” to “AI Prompt Case Collection”, applied across the header, footer, homepage sample label, share cards, and feeds in both languages.",
      "Fixed blurry Chinese nav text on some devices: the monospace font stack now falls back to proper CJK fonts instead of the device default.",
      "The header tagline and nav links switched from gray to black with larger sizes for better legibility on small and low-DPI screens.",
    ],
    tags: ["Brand", "Experience"],
  },
  {
    date: "2026-08-13",
    title: "Cards default back to full color, new scroll-reveal animation",
    items: [
      "Based on user feedback: card images are no longer grayscale by default with color only on hover — they now show full color right away, no more hovering each card one by one.",
      "Case lists and the homepage deck gained a scroll-reveal entrance animation: cards fade and slide in as you scroll, replacing the old grayscale-to-color hover interaction; devices with reduced motion enabled skip the animation.",
    ],
    tags: ["Experience"],
  },
  {
    date: "2026-08-11",
    title: "Image, UI, and video retest outputs are now viewable",
    items: [
      "Case detail pages gain an independent retest-evidence section: generated images and videos are directly viewable, while UI retests include desktop and mobile captures plus a download of the generated HTML source.",
      "Every retest file is explicitly labeled as a retest output, not the creator's original. Only the latest same-model result is expanded by default; earlier independent runs move into a numbered history to avoid looking like different models.",
      "Legacy Codex image-generation records are grouped under GPT Image 2 in the UI, while original run IDs and model-receipt disclosures remain intact.",
      "Model, test date, final score, and both AI judges' raw scores are public. Automated scores stay labeled as automated, and unverified generator identities are disclosed instead of implied.",
      "The first public batch contains 181 retest records: 87 image, 89 UI, and 5 MiniMax H3 768p video records. Failed generations remain visible as no-artifact evidence.",
    ],
    tags: ["Transparency", "Data"],
  },
  {
    date: "2026-08-09",
    title: "Weekly hot, digest archive, and stability sample scores",
    items: [
      "New Hot this week on the homepage: the six most-engaged cases from recent source posts, with the subtitle stating the actual data window; max two slots per creator.",
      "Daily digest back-issues: month-grouped archive plus prev/next paging across 28 issues; historical issues never show that day's retest block — retest evidence is only presented as of now.",
      "Navigation reordered: Rankings comes first and jumps straight to the two homepage boards, Daily moves to the end; each board now links to the full sorted case list.",
      "Search understands Chinese/English synonyms: 千问, 可灵, 智谱, 即梦 and more now match English-named cases; the public API benefits too.",
      "Stability sample scores (BETA) rolling out: the first 81 image cases now carry sample-based stability scores, labeled separately from human retest verdicts; other categories follow.",
    ],
    tags: ["Feature", "Experience"],
  },
  {
    date: "2026-08-08",
    title: "Mainland mirror entry, faster edges, and share cards",
    items: [
      "New mainland-friendly entry goodcase.carlwow.com, same content as the main domain; measured good reachability across mainland China.",
      "Edge caching overhauled: half the site used to recompute on every request; everything now serves from edge caches, cutting cold TTFB from ~2s to the 0.4s range.",
      "Social share cards completed site-wide: case cards composite the actual artwork, creator and Skill pages no longer share without an image; fixed WeChat picking another case's image when sharing video cases.",
      "Publishing a retest verdict now triggers a site rebuild automatically — new verdicts appear within minutes.",
    ],
    tags: ["Experience", "Infrastructure"],
  },
  {
    date: "2026-08-07",
    title: "Author-side dates for creators and Skills",
    items: [
      "Creator cards and pages show a Latest work date — the newest source publish time among their published cases.",
      "The Skill catalog and detail pages show a Latest example date from their supporting cases.",
      "Only author-side dates are shown: they reflect ecosystem activity; editorial actions on our side never produce public timestamps.",
    ],
    tags: ["Experience", "Transparency"],
  },
  {
    date: "2026-08-07",
    title: "Daily digest and Agent API launch; retest lab starts running",
    items: [
      "New daily digest (/daily): two cases a day — one fresh hit from the last 14 days and one worth revisiting. Selection is deterministic by date, so everyone sees the same pair, with a dedicated RSS feed.",
      "Agent API formalized (/agent-api): the public API stays usable without a key, now with documented rate limits; integrators can request an API key for higher quotas. Every case response now carries a provenance field confirming the prompt was verified against its source post.",
      "The retest lab is running: the first 10 image and web cases have been regenerated with current models for side-by-side comparison, prioritized by retest votes. Verdicts will appear after human review.",
    ],
    tags: ["Feature", "API"],
  },
  {
    date: "2026-08-07",
    title: "Real-device fixes: full-color images on mobile, vote anywhere",
    items: [
      "Images on phones are no longer stuck in grayscale: the hover-to-color effect is kept only for devices with a pointer; touch screens show full color right away.",
      "Retest votes can now be cast directly from any card, not just the detail page; a voted case shows its voted state everywhere.",
      "Fixed the prompt-translation toggle: on Chinese-original cases, tapping the English translation used to do nothing; it now switches correctly and remembers your preference per interface language.",
      "The install command on Skill pages no longer stretches mobile pages sideways; it scrolls within its own box and stays fully copyable.",
      "The source-post like count on detail pages now matches the size and style of the neighboring action buttons.",
    ],
    tags: ["Experience", "Mobile"],
  },
  {
    date: "2026-08-06",
    title: "Self-hosted video playback and equal-height cards",
    items: [
      "All case videos and posters now live on our own storage — playback no longer depends on third-party CDNs; failed loads show a clear message with retry and a link to the source post.",
      "32 cases had their prompts restored to the full original-post version (some had been truncated upstream; the longest grew from 253 to over 10,000 characters), with method breakdowns rewritten to match.",
      "Cards in the same row are now strictly equal-height: title, summary, and tag zones have fixed heights, and prompt blocks and stat rows align across cards.",
      "Cases awaiting a stability retest now show their current vote count.",
    ],
    tags: ["Experience", "Data"],
  },
  {
    date: "2026-08-05",
    title: "Account-free likes and retest votes",
    items: [
      "Likes are now real site-wide counts instead of local-only numbers: no signup, one count per browser per case, visible across devices.",
      "Cases without a measured stability score accept retest votes, with public running counts.",
      "Detail pages show the source post's real like count alongside, clearly labeled as an ingestion-time snapshot, never mixed into site counts.",
      "The public API gains real likedCount and retestVoteCount fields for agents.",
    ],
    tags: ["Features", "Transparency"],
  },
  {
    date: "2026-08-05",
    title: "Provenance cleanup: 33 cases unpublished",
    items: [
      "Every case ingested via aggregator channels was checked against its original source; 33 whose prompts could not be matched to the source post (likely reverse-engineered, or the author never published a prompt) were unpublished.",
      "Two cases were restored to the author's original Chinese prompt, keeping the previous English version as a translation.",
      "The ingestion pipeline gained three provenance gates: aggregator reverse-engineering markers are preserved, flagged candidates no longer auto-enter review, and prompts are automatically matched against source-post text at ingestion.",
      "One case with a publicly disputed attribution now carries a neutral note on its detail page.",
    ],
    tags: ["Data", "Transparency"],
  },
  {
    date: "2026-08-05",
    title: "Site-wide speedup and model browsing on production",
    items: [
      "Major page-weight cuts: the case list dropped from 4.5MB to about 180KB, creator pages from 1.1MB to about 97KB.",
      "Model browsing launched: filter cases by model family (Seedance, GPT Image, and more), with a model strip on the home page.",
      "Full bilingual support; switching languages keeps you on the current page.",
      "Case and creator lists are paginated; card media adapts to aspect ratio, so vertical videos and UI screenshots are no longer cropped.",
    ],
    tags: ["Experience", "Features"],
  },
  {
    date: "2026-07-28",
    title: "Creator methods and shared Skills derived from Cases",
    items: [
      "Creator credits on Case cards now link directly to creator pages, whose Case count covers all published work.",
      "A shared Skill appears only after the same method is evidenced by at least three Cases across two creators.",
      "A creator method requires at least three matching Cases by the same creator; source popularity is not part of the threshold.",
      "Skills have shareable evidence pages but remain outside the primary navigation and are not a separate submission type.",
    ],
    tags: ["Features", "Transparency"],
  },
  {
    date: "2026-07-27",
    title: "Operator metrics and agent entry points",
    items: [
      "The operator page now summarizes anonymous visits, case activity, submissions, public evidence, and hidden historical data from the last 30 days.",
      "Test feedback is explicitly marked and archived separately from real user suggestions.",
      "Added /llms.txt so agents can discover the public API, RSS, Skill, and evidence-use rules from one address.",
      "The public API and case library now support AI copy and AI hardware categories consistently.",
    ],
    tags: ["Operations", "Open"],
  },
  {
    date: "2026-07-25",
    title: "Agent access moved to the top and brand icons aligned",
    items: [
      "Agent Access is now the orange primary action in the header and home hero.",
      "Changelog and Feedback moved into the top navigation; the footer now contains only the brand and page note.",
      "Browser favicon, Apple icon, and the in-product thumbs-up mark now use one identity.",
    ],
    tags: ["Experience", "Brand"],
  },
  {
    date: "2026-07-23",
    title: "The popularity ranking became a traceable Source Heat Ranking",
    items: [
      "Source Heat reads likes, comments, reposts, saves, and capture time from the original post instead of using a static popularity score.",
      "Interactions use likes + 2×comments + 3×reposts + 4×saves; the final score combines within-platform interaction percentile, velocity, and data completeness.",
      "Cross-platform ranking is normalized within each platform first; missing fields remain null rather than being penalized as zero.",
      "Cases without a verifiable interaction snapshot can remain public but do not enter the ranking.",
    ],
    tags: ["Data", "Transparency"],
  },
  {
    date: "2026-07-11",
    title: "Search, favorites, RSS, Connect, and share posters",
    items: [
      "The case library now supports keyword search across models, methods, and creators.",
      "Favorites are stored locally in the browser and require no account.",
      "Added an RSS feed at /feed.xml, with new cases delivered automatically.",
      "Added the Connect page for Skill, RSS, and API access.",
      "Every case can generate a QR-coded share poster.",
    ],
    tags: ["Features"],
  },
  {
    date: "2026-07-10",
    title: "Open API and Skill launched",
    items: [
      "Released a free public API with anonymous access for case lists and case details.",
      "Released the GoodCase Skill so AI assistants can search and compare cases in conversation.",
    ],
    tags: ["Open"],
  },
  {
    date: "2026-07-09",
    title: "Cases no longer require registration",
    items: [
      "Removed the login wall so every public case is readable without an account.",
      "Full prompts and retest records are public; likes remain a local interest marker.",
    ],
    tags: ["Experience"],
  },
  {
    date: "2026-05-17",
    title: "GoodCase launched",
    items: [
      "The first 12 real AI cases launched across video, coding, and image creation.",
      "Each case surfaces source heat, stability, creators, prompts, and reproducibility signals.",
    ],
    tags: ["Launch"],
  },
  {
    date: "2026-07-11",
    title: "Next",
    items: [
      "Stability scores will increasingly come from Lab retests instead of manual labels.",
      "The submission workflow will continue to improve as more reproducible cases arrive.",
    ],
    tags: ["Roadmap"],
  },
];
