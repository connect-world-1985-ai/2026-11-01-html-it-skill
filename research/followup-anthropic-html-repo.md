# Follow-up：Anthropic「内部用 HTML 代替 Markdown」公开仓库

- 调研日期：2026-10-30（Asia/Shanghai）约 20:11–20:13
- 方式：只读 WebSearch / WebFetch / 无鉴权 GitHub API / HN Algolia / 公共 X 读取；未登录、未发帖
- 背景：Raymond 记得数月前 Anthropic 研究员/员工公开分享过「内部用 HTML 而非 Markdown」的 GitHub 仓库；喜欢 Claude 的 HTML 输出风格
- 已对照：`/workspace/2026-10-30-adaptive-html-research/report.md`（已覆盖 `frontend-design` / `web-artifacts-builder` / Artifacts，本 follow-up 不重复展开）

---

## 结论（优先）

1. **最佳匹配：`anthropics/html-effectiveness`** — https://github.com/anthropics/html-effectiveness  
   - 作者叙事：Thariq Shihipar（Claude Code / Anthropic；官方博客署名 *member of technical staff*）  
   - 内容：博客主张「用 HTML 代替 Markdown 做 agent 输出」的配套示例库——**20 个无构建、无依赖的自包含 `.html`**（code review、design system、slide deck、status/incident、PR write-up、交互编辑器等）+ `index.html`  
   - 分享：2026-05-08 X Article（`@trq212`），2026-05-09 HN（528 pts），2026-05-20 正式上 Claude Blog；示例站 https://thariqs.github.io/html-effectiveness/  
2. **与 Claude HTML 风格的关系**：同一人/同一条产品线叙事；博客明确提到可用 **frontend design plugin** 改善品味，并可用 Claude Design / 「make an HTML artifact」；**示例库本身不是** `frontend-design` 或 `web-artifacts-builder` skill，而是「HTML > Markdown」工作法与样例。既有主报告中的 skills/Artifacts 是**相关配套**，不是本仓库本体。  
3. **其他 Anthropic 开源 HTML 相关**：主要是 **`anthropics/skills`** 里的 `frontend-design`、`web-artifacts-builder`，以及 `brand-guidelines` / `theme-factory` / `canvas-design` 等视觉向 skill。第三方 `plannotator/effective-html` 是**社区**对 html-effectiveness 风格的封装，**非** Anthropic 官方仓。

---

## 口语摘要（≤150 字，已核）

最佳匹配：anthropics/html-effectiveness（Thariq/Claude Code，2026-05）。主张 HTML 替 Markdown，含 20 个自包含示例。相关非同仓：frontend-design、web-artifacts-builder。

（字数：138。）

---

## (1) 仓库：名称、链接、作者、分享渠道、内容

### 最佳匹配

| 项 | 内容 | 来源（抓取 2026-10-30） |
|---|---|---|
| 名称 | **html-effectiveness** | GitHub API `GET /repos/anthropics/html-effectiveness` |
| 链接 | https://github.com/anthropics/html-effectiveness | 同上 |
| Owner | **anthropics**（组织仓） | API `owner.login` |
| 创建 / 推送 | created **2026-05-12T06:25:16Z**；pushed 2026-07-03；stars **689**（API 当时） | 同上 |
| 描述 | “HTML effectiveness examples”；README：博客配套 gallery，每文件自包含 `.html` | README raw |
| 内容清单 | 20 个编号 HTML（01–20）+ `index.html` + LICENSE(MIT) 等；类别含 Exploration / Code / Prototyping / Communication / Diagrams & research / Custom editing UIs | API contents + README |
| 示例站 | https://thariqs.github.io/html-effectiveness/ | X Article 正文；README/站内互指 |
| 作者（叙事） | **Thariq Shihipar** | Claude Blog byline；X `@trq212`；GitHub user `ThariqS` bio「Claude Code @anthropics」 |

### Anthropic 身份确认（多源）

| 证据 | 说法 | 链接 |
|---|---|---|
| 官方博客 | AUTHOR **Thariq Shihipar**；文末 *member of technical staff*；写 Claude Code 团队他人也在用 HTML | https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html （Published **May 20, 2026**；WebFetch） |
| X | `@trq212`；Article 写 *others on the Claude Code team*；bio 现为「formerly Claude Code @anthropicai」 | https://x.com/trq212/status/2052809885763747935 （created **2026-05-08T17:56:30.000Z**；X MCP） |
| GitHub | `ThariqS` bio：**Claude Code @anthropics** | `GET /users/ThariqS` 无鉴权 API |

> 说明：X bio 现写 *formerly*，博客发表时写 *member of technical staff*。当前是否仍在职 → **未核实（实时 HR）**；发表时身份有官方博客背书。

### 何时、在哪里分享

| 渠道 | 时间（源时间戳） | 备注 |
|---|---|---|
| **X Article** `@trq212` | 2026-05-08 17:56 UTC（≈ 2026-05-09 01:56 Asia/Shanghai） | 长文；链示例站；后注明已上 Claude Blog |
| **Hacker News** | 2026-05-09 04:53 UTC；item **48071940**；528 points；链到上述 tweet | https://news.ycombinator.com/item?id=48071940 |
| **Claude Blog** | Published **May 20, 2026** | 正式文章 + 指向 GitHub gallery |
| GitHub 仓 | created 2026-05-12 | 略晚于 X/HN 首发（首发链 thariqs.github.io） |

对 Raymond「几个月前」：相对 2026-10-30，约 **5–5.5 个月前**，吻合。

### 其他候选

| # | 候选 | 为何不是最佳 / 关系 |
|---|---|---|
| A | **anthropics/html-effectiveness** | **最佳匹配** |
| B | https://thariqs.github.io/html-effectiveness/ | **同一 gallery 的 Pages 站** |
| C | **anthropics/skills**（`frontend-design`、`web-artifacts-builder` 等） | 官方 skills；**不是**「HTML instead of Markdown」仓库本体（主报告已覆盖） |
| D | **plannotator/effective-html** | 社区 skill；credit html-effectiveness；**非 Anthropic** |
| E | `@trq212` 2026-10 推广的 **html-plan** 插件 | 后续实验；**不是**数月前主分享 |
| F | 2021「The unreasonable effectiveness of simple HTML」 | 无关撞名旧文 |

主回忆点**已找到**匹配；未硬凑。

---

## (2) 与 Claude HTML 风格 / frontend-design / Artifacts / skills

| 关系 | 判定 | 依据 |
|---|---|---|
| agent 输出用 HTML 富文档替代长 Markdown | **直接相关** | 博客 / X Article |
| Claude Artifacts / 「make an HTML artifact」 | **相关用法** | 博客 Getting started |
| `frontend-design` | **相关但不同仓** | 博客 FAQ 提到 frontend design plugin |
| `web-artifacts-builder` | **相关但不同仓** | 复杂 React→单文件；本 gallery 为无构建 vanilla HTML |
| html-effectiveness = Claude 默认 UI 皮肤？ | **否（未宣称）** | 方法论+示例，非产品皮肤源码 |

---

## (3) 其他 Anthropic 开源 HTML 相关

1. **`anthropics/skills`** — https://github.com/anthropics/skills  
   无鉴权 `GET .../contents/skills`（2026-10-30）可见相关目录：`frontend-design`、`web-artifacts-builder`、`brand-guidelines`、`theme-factory`、`canvas-design`、`webapp-testing`（共 19 个 skill 目录）。  
2. **`anthropics/html-effectiveness`** — 本 follow-up 主角。  
3. **非 Anthropic 衍生**：`plannotator/effective-html`。

`GET /search/repositories?q=org:anthropics+html` 本回合 **403** → 未能用搜索 API 穷尽组织仓；穷尽性标未核实。

---

## 未核实

1. Thariq 在 2026-10-30 **是否仍在职** Anthropic（X bio 写 formerly）。  
2. 组织内是否还有未搜到的 HTML 相关仓（search API 403）。  
3. `html-plan@claude-community` 的正式源码树与维护归属（仅见 X 安装指令）。  
4. Pages 站与 org 仓是否始终字节级同步。  
5. stars 会变；689 为抓取瞬间。

---

## 来源索引

| ID | 来源 | 抓取 |
|---|---|---|
| G1 | https://api.github.com/repos/anthropics/html-effectiveness | 2026-10-30 |
| G2 | https://raw.githubusercontent.com/anthropics/html-effectiveness/main/README.md | 同日 |
| G3 | https://api.github.com/users/ThariqS | 同日 |
| G4 | https://api.github.com/repos/anthropics/skills + `/contents/skills` | 同日 |
| B1 | https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html | 同日 |
| X1 | https://x.com/trq212/status/2052809885763747935 | 同日 |
| HN1 | https://news.ycombinator.com/item?id=48071940 | 同日 |
| P1 | https://thariqs.github.io/html-effectiveness/ | 正文引用 |
| R0 | `/workspace/2026-10-30-adaptive-html-research/report.md` | 既有 |

---

*只存本地；未上传、未发送。*
