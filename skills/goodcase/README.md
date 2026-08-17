# goodcase Skill

## 安装 / Install

```bash
# Claude Code（复制到用户级 skills 目录）
cp -r skills/goodcase ~/.claude/skills/goodcase
```

其他兼容 SKILL.md 的平台（Codex CLI / Cursor / Gemini CLI 等）：把 `skills/goodcase/` 目录复制到对应平台的 skills 目录即可。

## 是什么 / What

让 AI Agent 直接查询 [goodcase.ai](https://goodcase.ai) 上人工精选的 AI 爆款案例：真实出处、创作者署名、完整 Prompt、推荐模型、稳定分与成本档。公开 API，无需任何 Key。

Lets AI agents query hand-curated viral AI cases from [goodcase.ai](https://goodcase.ai): real sources, creator attribution, full prompts, recommended models, stability scores and cost bands. Public API, no key required.

## 用法 / Usage

装好后直接问 Agent，例如：

- 「找几个 AI 视频的爆款案例」
- 「有没有玻璃质感的图像 prompt」
- 「这条 case 的完整提示词给我」

Just ask your agent things like "show me viral AI video cases" or "find a prompt for glass-texture images" — the skill routes to the goodcase.ai public API automatically.
