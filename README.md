# GoodCase.ai Lite

[English](README_EN.md) | 中文

[![Site](https://img.shields.io/badge/site-goodcase.ai-orange)](https://goodcase.ai)

[goodcase.ai](https://goodcase.ai) 的开源站点版本：clone 下来就能跑起同样的 UI，自带一组真实样例案例（含完整提示词与媒体）。

```bash
git clone https://github.com/LearnPrompt/goodcase-lite.git
cd goodcase-lite
npm ci
npm run dev
```

打开 http://localhost:3000 即可。不需要配置任何环境变量——没接数据库时站点自动使用内置样例数据，首页、案例库、案例详情、创作者页全部可用。

## 这是什么

GoodCase.ai 追踪正在传播的 AI Case，把作品、作者、方法、原始来源与复测证据放回同一个页面。这个仓库是它的站点部分：

- 完整的前台 UI：首页、案例库（筛选/搜索）、案例详情（提示词、稳定分、成本档）、创作者页、每日早报
- 内置样例数据：一组真实案例（含媒体），fork 后开箱即用
- 公开 Agent API 的实现（`/api/public/cases`）

线上站点的数据供给、审核后台与自动化采集属于内部系统，不在本仓库中。想直接使用完整数据，走线上公开 API 即可，无需 API Key：

```bash
curl -s "https://goodcase.ai/api/public/cases?take=3&locale=zh-CN"
```

接入文档见 [goodcase.ai/connect](https://goodcase.ai/connect)。

## 接入自己的数据（可选）

把 `.env.example` 复制为 `.env.local`，填入你自己的 Supabase 项目地址与密钥，站点即切换到你的数据库。表结构可以参考 `/api/public` 路由与 `src/lib/cases.ts` 中的行类型自行建立。

## 部署

标准 Next.js 应用，Vercel 一键部署或任何支持 Node.js 的平台均可。

## License

MIT
