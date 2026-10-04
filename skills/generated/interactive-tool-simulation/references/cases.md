# Case evidence

This workflow is derived from 6 published Cases across 6 creators.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · 生成 40 个带下载按钮的简单 SVG 图标

- Creator: @kawai_design
- Evidence: [GoodCase](https://goodcase.ai/cases/40-svg-5229d1feb246) · [finished media](https://media.goodcase.ai/media/image/40-svg-5229d1feb246.jpg) · [original source](https://x.com/kawai_design/status/1991461556597715056)
- Summary: 一个日文提示，要求 Gemini 生成 40 个浅蓝色线条风格的简单、多功能 SVG 图标，并为每个图标提供下载按钮。
- Prompt excerpt:

> シンプルで汎用性が高いアイコン{argument name="icon_count" default="40"}種類をSVG形式で生成してください。必ずCanvasに描画がしてください。色は{argument name="icon_color" default="ライトブルー"}。背景は{argument name="background_color" default="白"}。線のアイコン。マテリアルデザイン。SVGアイコンをSVGデータとしてダウンロードできるボタンを付けてください。

### E2 · Gemini 中类似 CapCut 的视频编辑器 UI

- Creator: @lepadphone
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-capcut-ui-4debc58e6a0e) · [finished media](https://media.goodcase.ai/cases/7a3116a3f962.jpg) · [original source](https://x.com/lepadphone/status/1990834118511505486)
- Summary: 一个非常简单的高级提示，用于使用 Gemini 设计一个 CapCut（剪映）风格的视频编辑应用程序界面。
- Prompt excerpt:

> Design a {argument name="app_name" default="CapCut"}.

### E3 · Gemini Formula 1 动态数据面板

- Creator: @CryptoEights
- Evidence: [GoodCase](https://goodcase.ai/cases/gemini-formula-1-5fb69c5e1530) · [finished media](https://media.goodcase.ai/media/video/gemini-formula-1-5fb69c5e1530.mp4) · [poster](https://media.goodcase.ai/media/poster/gemini-formula-1-5fb69c5e1530.jpg) · [original source](https://x.com/CryptoEights/status/2026284847480918093)
- Summary: @CryptoEights 使用 Gemini 3.1 · React · Framer Motion完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Prompt to build the F1 Dashboard:
>
> "Build a cinematic, high-end Formula 1 live dashboard using React, Tailwind CSS, and Framer Motion. The design should be dark, immersive, and feel like a professional broadcast overlay.
>
> 1. Layout & Background:
> Set the background to be a full-screen, looping, muted video of a realistic F1 car driving on a track (use this video URL: ).
>
> Overlay the video with a dark gradient (black to transparent) from the top, and a red radial gradient from the bottom to simulate an underglow effect.
>
> Use a dark theme (bg-[#0a0a0a]) with white text.
>
> Import and use Inter for standard text and Space Grotesk for large display numbers and headers.
>
> 2. Header & Hero Section:
> Top bar: Include a back arrow icon, the title 'São Paulo Grand Prix 2026', and buttons for 'Live Updates' and 'Highlights', plus a small US flag icon.
>
> Center hero: Display 'Formula 1' in massive, bold text (text-[140px]). Above it, add a small subtitle with the Audi rings logo (SVG), 'Powertrain', a German flag, and 'Neuburg, Germany'. Animate these elements to fade and slide up on load using Framer Motion.
>
> 3. Bottom Data Panels (Grid Layout):
> Create three glassmorphic panels at the bottom (bg-[#111111]/60 backdrop-blur-xl border border-white/5):
> Panel 1 (Max Speed):
> Title: 'MAX SPEED'
> Value: Create a custom React hook/component that smoothly animates a number counting up from 0 to 372.5 over 2.5 seconds. Display 'km/h' next to it.
>
> Subtitle: 'Maximum speed recorded during test session'.
>
> Panel 2 (Live Track Map):
> Draw a custom SVG path representing an F1 circuit. Give the path a red/ora…

### E4 · Lumi 租房真实成本计算器

- Creator: @lumidotnew
- Evidence: [GoodCase](https://goodcase.ai/cases/lumi-fcc36eede4ad) · [finished media](https://media.goodcase.ai/media/video/lumi-fcc36eede4ad.mp4) · [poster](https://media.goodcase.ai/media/poster/lumi-fcc36eede4ad.jpg) · [original source](https://x.com/lumidotnew/status/2028713799533109599)
- Summary: @lumidotnew 使用 Lumi完成的网页案例，包含公开结果、完整 Prompt 与原始来源。
- Prompt excerpt:

> Create a high-fidelity, interactive web app that turns a headline rent price into the real monthly cost and real annual cost.
>
> ## Core idea
> Users often see a listing price and only compare monthly rent, while ignoring deposit, agent fee, utilities, move-in costs, and commuting. This calculator reveals the true cost in a clear, slightly reality check tone.
>
> ## UX goals
> * Fast to use, no clutter, mobile-friendly
> * Inputs feel like a real renting scenario
> * Output is instantly understandable, with transparent breakdown
> * Tone: calm, practical, lightly witty, never judgmental
>
> ## Layout
> Single page, 3 sections, sticky results card on desktop:
>
> 1. Listing Basics
> 2. Hidden Costs
> 3. Commute Cost
> Right side: Reality Check Summary card (on mobile, summary appears below and stays accessible via a floating “Summary” button).
>
> ## Inputs
>
> ### 1) Listing Basics
> * Currency selector (default: SGD)
> * Monthly rent (number)
> * Lease length (months) selector: 6 / 12 / 18 / 24 (default 12)
> * Move-in date (optional, only for UI polish, does not affect math)
> * “Is rent negotiable?” toggle (optional)
>   If ON: show a slider “Discount” 0% to 10% to adjust rent
>
> ### 2) Hidden Costs
> All costs should support common patterns with friendly presets:
>
> * Deposit
>   * Dropdown: 1 month, 2 months, Custom
>   * If Custom: numeric input (amount)
>
> * Agent fee
>   * Dropdown: None, Half month, 1 month, Custom
>   * If Custom: numeric input (amount)
>
> * Utilities (monthly)
>   * Electricity (number)
>   * Water (number)
>   * Internet (number)
>   * Optional: “Other monthly fees” (number)
>
> * One-time move-in costs (optional)
>   * C…

### E5 · 在 MuJoCo 中进行机器人绘图仿真

- Creator: @dimentary
- Evidence: [GoodCase](https://goodcase.ai/cases/mujoco-9c07f692fecb) · [finished media](https://media.goodcase.ai/cases/5de72d97a8d2.jpg) · [original source](https://x.com/dimentary/status/2097141042214797801)
- Summary: 构建 MuJoCo 物理环境并为多指机械臂开发控制器以绘制艺术作品的指南。
- Prompt excerpt:

> build a MuJoCo setup and write a controller to draw Picasso’s dove using a robot arm and a five-fingered hand

### E6 · 一句话生成交通信号灯模拟

- Creator: @diegocabezas01
- Evidence: [GoodCase](https://goodcase.ai/cases/youmind-traffic-light-simulation-python) · [finished media](https://media.goodcase.ai/media/video/youmind-traffic-light-simulation-python.mp4) · [poster](https://media.goodcase.ai/media/poster/youmind-traffic-light-simulation-python.jpg) · [original source](https://x.com/diegocabezas01/status/2064409084112044539)
- Summary: 十六个词的极简提示，只说要写一段可视化单行道红绿灯逻辑加随机车流的 Python 代码，没有指定任何视觉细节，模型要自己判断这个需求需不需要图形界面，是测试模型自主判断能力而不是测试提示词技巧的经典案例。
- Prompt excerpt:

> write a python code that visualizes how a traffic light works in a one way street with cars entering at random rate.

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| 生成 40 个带下载按钮的简单 SVG 图标 | @kawai_design | [GoodCase](https://goodcase.ai/cases/40-svg-5229d1feb246) | [Media](https://media.goodcase.ai/media/image/40-svg-5229d1feb246.jpg) | [Original](https://x.com/kawai_design/status/1991461556597715056) | E1 |
| Gemini 中类似 CapCut 的视频编辑器 UI | @lepadphone | [GoodCase](https://goodcase.ai/cases/gemini-capcut-ui-4debc58e6a0e) | [Media](https://media.goodcase.ai/cases/7a3116a3f962.jpg) | [Original](https://x.com/lepadphone/status/1990834118511505486) | E2 |
| Gemini Formula 1 动态数据面板 | @CryptoEights | [GoodCase](https://goodcase.ai/cases/gemini-formula-1-5fb69c5e1530) | [Media](https://media.goodcase.ai/media/video/gemini-formula-1-5fb69c5e1530.mp4) | [Original](https://x.com/CryptoEights/status/2026284847480918093) | E3 |
| Lumi 租房真实成本计算器 | @lumidotnew | [GoodCase](https://goodcase.ai/cases/lumi-fcc36eede4ad) | [Media](https://media.goodcase.ai/media/video/lumi-fcc36eede4ad.mp4) | [Original](https://x.com/lumidotnew/status/2028713799533109599) | E4 |
| 在 MuJoCo 中进行机器人绘图仿真 | @dimentary | [GoodCase](https://goodcase.ai/cases/mujoco-9c07f692fecb) | [Media](https://media.goodcase.ai/cases/5de72d97a8d2.jpg) | [Original](https://x.com/dimentary/status/2097141042214797801) | E5 |
| 一句话生成交通信号灯模拟 | @diegocabezas01 | [GoodCase](https://goodcase.ai/cases/youmind-traffic-light-simulation-python) | [Media](https://media.goodcase.ai/media/video/youmind-traffic-light-simulation-python.mp4) | [Original](https://x.com/diegocabezas01/status/2064409084112044539) | E6 |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
