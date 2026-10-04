# Case evidence

This workflow is derived from 7 published Cases across 7 creators.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · 动态口语诗电影提示词

- Creator: @techhalla
- Evidence: [GoodCase](https://goodcase.ai/cases/case-1247334c2204) · [finished media](https://media.goodcase.ai/cases/65980be85446.mp4) · [poster](https://media.goodcase.ai/cases/96aa6c2a97c3.jpg) · [original source](https://x.com/techhalla/status/2103411244468498547)
- Summary: 一个高度详细的提示词，用于创作一部名为“BUILD THE FLOOR”的 20 秒动态口语诗电影，指定了艺术指导、演讲内容、视觉规则、分镜脚本和工程约束。
- Prompt excerpt:

> Create a 20.00-second kinetic spoken-word film titled “BUILD THE FLOOR.” Treat this as an original miniature speech staged entirely through typography. Every line changes the architecture of the frame. The final declaration must stand on something the earlier words physically constructed. Deliver one self-contained HTML file, 1080×1080, targeting 60fps, using SVG and/or Canvas. Embed all required assets.
>
> ART DIRECTION
> Background #102820. Paper #F4E9D5. Structural accent #F2B544. A literary editorial world with the scale and confidence of a public monument. Use a high-contrast serif for the speech, a heavy grotesque for load-bearing words, and a restrained monospace for small timing marks. No distressed protest-poster clichés, megaphones, flags, crowds, microphones, or stock footage.
>
> ORIGINAL SPEECH — EXACT WORDS, EXACT ORDER
> “We were told to wait.”
> “So we learned the weight of waiting.”
> “Then one voice made room.”
> “Then another.”
> “Now the floor belongs to us.”
>
> Do not attribute these words to any real person. No extra slogans. The complete speech must be understandable without audio.
>
> CENTRAL VISUAL RULE
> Words have assigned architectural roles. WAIT is a lintel. WAITING is a suspended load. VOICE is a support. ROOM is an opening. FLOOR is a platform. These roles must emerge from the actual letterforms, not from separate illustrations placed behind text.
>
> STORYBOARD
> 0.00–3.00 “We were told to wait.” The sentence occupies a narrow horizontal opening beneath a massive WAIT. The opening slowly compresses while the sentence remains readable. The pressure comes from the layout,…

### E2 · 波特兰公交服务地图动画

- Creator: @milos_gis
- Evidence: [GoodCase](https://goodcase.ai/cases/case-3003770cb528) · [finished media](https://media.goodcase.ai/cases/8535ce0c6ac4.mp4) · [poster](https://media.goodcase.ai/cases/71a61fb2ecf4.jpg) · [original source](https://x.com/milos_gis/status/2103751211040317580)
- Summary: 使用 GTFS 数据和 Three.js/Forge3d，创建一个波特兰公交服务路线的 3D 地图可视化动画，展示普通周二期间车辆在各社区间的运行轨迹，采用浅色主题。
- Prompt excerpt:

> Create a video of Portland, OR's bus service on a random Tuesday! Showcase Portland's different neighborhoods at a high level and then zoom in on specific routes in each quadrant (absorbing North Portland into NE and South Portland into SW for brevity). Use a light theme. Slow down the speed of the bus animation when zoomed in, without increasing the total duration too much so the viewer can appreciate some of the landscape and streets it travels through in a given loop.

### E3 · 用 GSAP 和 Three.js 写代码做高端动效视频

- Creator: @everestchris6
- Evidence: [GoodCase](https://goodcase.ai/cases/case-48175d8e8ac4) · [finished media](https://media.goodcase.ai/cases/f0b654c82794.mp4) · [poster](https://media.goodcase.ai/cases/10c13d474cd1.jpg) · [original source](https://x.com/everestchris6/status/2104965415164399895)
- Summary: 一份全面的系统提示词，用于使用 GSAP 和 Three.js 生成高端动态视频，涵盖设置、参考研究及运动原则。
- Prompt excerpt:

> <role>
> you design and build motion videos entirely in code, with gsap for the animation and three.js for any 3d. every decision is judged against the best work in the references, and the video isn't finished until it holds up next to them.
> </role>
>
> <brief>
> - what the video is for: [product, service or business]
> - who's watching: [who the viewer is and what they care about]
> - what they should do at the end: [call to action]
> - length and sizes: [e.g. 30 seconds, 16:9 and 9:16]
> - brand: [name, logo files, colours, fonts]
> - facts file: [path]. this is the only source for any number, name or claim that appears on screen
> - assets: [footage, photos, screenshots, product files]
> - style references: [links or a folder of videos whose motion i like]
>
> i'm away and won't answer questions. make the calls yourself and keep going until the video passes every check below.
> </brief>
>
> <kit>
> before anything else, clone and read https://t.co/FMs1prnPP0. read SKILL.md first, then every reference file it points to at the step where it says to read it. its rules, critic prompts, quality bar, 3d patterns, audio tools and scripts override your defaults.
> </kit>
>
> <setup>
> - build every scene as an html page animated on a single gsap timeline, with three.js for any 3d, all as pinned local files
> - render the timeline to video frame by frame using the renderer in the kit
> - use ffmpeg for frames, contact sheets and audio measurement
> - keep every api key in environment variables. never write a key into any file
> - render a 5 second test first and confirm it works before building the real video
> </setup>
>
> <stud…

### E4 · 单页 HTML 做 30 秒商业动画解说

- Creator: @alex_prompter
- Evidence: [GoodCase](https://goodcase.ai/cases/case-df71349792f3) · [finished media](https://media.goodcase.ai/cases/23fa6c689abf.mp4) · [poster](https://media.goodcase.ai/cases/6e3c7097c1e0.jpg) · [original source](https://x.com/alex_prompter/status/2103499977632997524)
- Summary: 为 Claude Opus 5.5 设计的结构化提示词，用于生成基于 HTML 的 30 秒商业动画解说视频。
- Prompt excerpt:

> Adopt the role of an expert motion designer. Build a 30-second animated explainer for my business as a single HTML page. 5 scenes. The customer's problem, what I do, how it works in 3 steps, one proof point, and my name at the end. Bold text, smooth transitions, my brand colours. My business {argument name="business_description" default="[DESCRIBE WHAT YOU SELL, WHO IT'S FOR AND YOUR COLOURS]"}

### E5 · Room to Quarks 缩放动画

- Creator: @VictorTaelin
- Evidence: [GoodCase](https://goodcase.ai/cases/room-to-quarks-8828fb5f29d0) · [finished media](https://media.goodcase.ai/cases/2383d2856499.mp4) · [poster](https://media.goodcase.ai/cases/53fe48a44c94.jpg) · [original source](https://x.com/VictorTaelin/status/2103299766473875778)
- Summary: 由 Opus 5.5 使用 HTML 和 Three.js 构建的缩放动画更新版本，展示从房间到 MacBook、Apple M4 芯片、原子再到夸克的过渡效果。
- Prompt excerpt:

> Create an animated sequence that starts in a room, zooms into a MacBook, then into an Apple M4 chip, followed by atoms, and finally quarks. Use HTML and Three.js for rendering.

### E6 · SpaceX 火星着陆页面动画

- Creator: @Kisalay_
- Evidence: [GoodCase](https://goodcase.ai/cases/spacex-05c7bcc20e78) · [finished media](https://media.goodcase.ai/media/video/spacex-05c7bcc20e78.mp4) · [poster](https://media.goodcase.ai/media/poster/spacex-05c7bcc20e78.jpg) · [original source](https://x.com/Kisalay_/status/2088392724730761524)
- Summary: 一款高端着陆页面设计，展示 SpaceX Starship 在黄昏时分降落火星的场景，采用柔和的香槟色调，并具备适合视频动态的电影级深度。
- Prompt excerpt:

> Landing page hero section design for SpaceX Starship landing on Mars at dusk, soft warm off-white and pale stone canvas, oversized clean photographic imagery with gentle natural light, elegant muted champagne and soft gray tones with subtle cyan accents, ultra-clean composition, sophisticated high-end typography, subtle floating glass elements, generous negative space, soft diffused lighting, minimal technical details, polished luxury product aesthetic, calm and refined atmosphere, ultra-high detail 12k quality, cinematic depth ready for smooth video motion

### E7 · 什么是 Transformer Explainer

- Creator: @dotey
- Evidence: [GoodCase](https://goodcase.ai/cases/transformer-explainer-7d2aa7449fc4) · [finished media](https://media.goodcase.ai/cases/68536239806b.mp4) · [poster](https://media.goodcase.ai/cases/ef95ea0eb814.jpg) · [original source](https://x.com/dotey/status/2103683057689522564)
- Summary: 用于创建基于 JS 的视频的提示词，旨在以高中生也能理解的方式深入讲解 Transformer 架构的技术细节。
- Prompt excerpt:

> 帮我用js制作一个视频，主题是：什么是 Transformer
> 要深入浅出，让高中生也能看得懂，不仅high level说的清楚，也要有细节，包括注意力机制，甚至一些数学概念
>
> 你可以用任何工具或者安装工具，可以联网检索
>
> 请给我惊喜

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 动态口语诗电影提示词 | @techhalla | [GoodCase](https://goodcase.ai/cases/case-1247334c2204) | [Media](https://media.goodcase.ai/cases/65980be85446.mp4) | [Original](https://x.com/techhalla/status/2103411244468498547) | E1 |
| 波特兰公交服务地图动画 | @milos_gis | [GoodCase](https://goodcase.ai/cases/case-3003770cb528) | [Media](https://media.goodcase.ai/cases/8535ce0c6ac4.mp4) | [Original](https://x.com/milos_gis/status/2103751211040317580) | E2 |
| 用 GSAP 和 Three.js 写代码做高端动效视频 | @everestchris6 | [GoodCase](https://goodcase.ai/cases/case-48175d8e8ac4) | [Media](https://media.goodcase.ai/cases/f0b654c82794.mp4) | [Original](https://x.com/everestchris6/status/2104965415164399895) | E3 |
| 单页 HTML 做 30 秒商业动画解说 | @alex_prompter | [GoodCase](https://goodcase.ai/cases/case-df71349792f3) | [Media](https://media.goodcase.ai/cases/23fa6c689abf.mp4) | [Original](https://x.com/alex_prompter/status/2103499977632997524) | E4 |
| Room to Quarks 缩放动画 | @VictorTaelin | [GoodCase](https://goodcase.ai/cases/room-to-quarks-8828fb5f29d0) | [Media](https://media.goodcase.ai/cases/2383d2856499.mp4) | [Original](https://x.com/VictorTaelin/status/2103299766473875778) | E5 |
| SpaceX 火星着陆页面动画 | @Kisalay_ | [GoodCase](https://goodcase.ai/cases/spacex-05c7bcc20e78) | [Media](https://media.goodcase.ai/media/video/spacex-05c7bcc20e78.mp4) | [Original](https://x.com/Kisalay_/status/2088392724730761524) | E6 |
| 什么是 Transformer Explainer | @dotey | [GoodCase](https://goodcase.ai/cases/transformer-explainer-7d2aa7449fc4) | [Media](https://media.goodcase.ai/cases/68536239806b.mp4) | [Original](https://x.com/dotey/status/2103683057689522564) | E7 |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
