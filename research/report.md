# AI Agent 输出 → 自适应 HTML：成熟工具与做法调研

- 调研日期：2026-10-30（Asia/Shanghai）
- 范围：只读公开网页；不注册、不登录、不购买、不上传、不推送
- 用例：Raymond（软件工程师）常让 agent 产出 feature design、PR 内容、code review；需要按内容类型智能选 HTML 形态，最终 ideally 为可分享的单文件 HTML 或 deck

---

## 结论

**推荐优先走「内容类型路由 skill/prompt + 单文件 HTML 产出」这条线，而不是找一个万能的 markdown→HTML 转换器。** 目前没有单一成熟产品能同时完美覆盖：①按内容类型切换布局、②产出团队可直接打开的单文件 HTML、③零账号分享。最接近 Raymond 需求的组合是：用 Anthropic `frontend-design` + `web-artifacts-builder`（或等价 skill）让 agent 按 feature design / PR / code review 选择布局并打成 `bundle.html`；迭代期用 Claude Artifacts 或 Cursor Pages/Canvas 预览分享；定稿后导出自包含 HTML 发给同事。若要做演示型 walkthrough，reveal.js（辅以 Marp）最稳；长文档用 Pandoc/Quarto 的 `embed-resources`。json-render / CopilotKit 等 generative UI 在「应用内自适应界面」上很成熟，但对「发一个 HTML 文件给同事」契合度低。下文各选项均附来源与抓取日期；无法交叉核实处标「未核实」。

---

## English spoken summary（228 words）

Here's the short version of what I found. The best path for Raymond is not one tool, but a small stack. Have the agent classify the markdown by content type, feature design, pull request, or code review, then pick a layout, and emit one self-contained HTML file. Anthropic's frontend-design and web-artifacts-builder skills are the strongest ready-made guidance for that adaptive look, and Claude Artifacts can already produce and download standalone HTML. For team sharing without forcing everyone onto Claude, export that HTML and send the file, or host it on a static drop. Cursor Pages can also host a shareable page with an anyone-with-the-link option when public sharing is allowed. For slide-style walkthroughs, reveal.js is the most mature single-file friendly deck engine, with Slidev close behind for Markdown-first decks though its true single-file export is contested in the docs. Pandoc or Quarto are excellent when you want a polished long document as one HTML file, but they will not invent a different layout per content type unless you add templates yourself. Generative UI libraries like json-render and CopilotKit are mature for in-app adaptive interfaces, yet they are a poor fit if the goal is a portable HTML file for email or chat. So the practical recommendation is skill-driven adaptive HTML generation, with Claude Artifacts or Cursor Pages for iteration, and a self-contained HTML export for the final handoff.

（字数经 `wc -w` 核实：228）

---

## 一览表

| # | 选项 | 类型 | 内容自适应 | 单文件 HTML | 团队分享 | 契合度 |
|---|------|------|------------|-------------|---------|--------|
| 1 | Claude Artifacts（含 Design/Slides/Claude Code） | Agent 内置呈现 | 高（模板+自由 HTML） | 中高（Design 可 standalone HTML；原生分享常需账号） | 中（原生分享多需 Claude 账号） | **高** |
| 2 | Anthropic skills：frontend-design + web-artifacts-builder | Skill/Prompt | 高 | 高（bundle 成单 HTML） | 高（文件可直发） | **高** |
| 3 | 自建「内容类型路由」skill → 单文件 HTML | Skill/Prompt 做法 | 高（专为用例设计） | 高 | 高 | **高** |
| 4 | Cursor Canvas / Grok Bot Pages | Agent 内置呈现 | 中高 | 低–中（Pages 是托管页；Canvas 源非通用 HTML） | 中高（Pages 可 anyone-with-link） | **中** |
| 5 | ChatGPT Sites（Canvas 已从现行模型移除） | Agent 内置呈现 | 中高 | 低（托管站点，非本地单文件为主） | 中高（Sites 分享链接） | **中** |
| 6 | reveal.js（+ Markdown/导出工具） | 开源 deck | 低–中（幻灯片形态固定） | 中高（可自包含导出） | 高 | **中** |
| 7 | Slidev | 开源 MD deck | 中（开发者主题/组件） | **有冲突**（见正文） | 高（SPA/托管） | **中** |
| 8 | Pandoc / Quarto（embed-resources） | 单文件报告生成 | 低（需自写模板才自适应） | 高 | 高 | **中**（文档类） |
| 9 | Vercel json-render | Generative UI 库 | 高（组件目录约束） | 低（需自研导出） | 低（应用内） | **低**（对单文件分享） |
| 10 | CopilotKit + A2UI generative UI | Generative UI 栈 | 高 | 低 | 低（应用内） | **低**（对单文件分享） |

辅助提及（未单列满分项）：Marp（更简单的 MD→deck，单文件常需 Monolith 等二次内联）。

---

## 各选项详情

### 1. Claude Artifacts（含 Design / Slides / Claude Code artifacts）

**是什么 / 做什么**  
Claude 把可独立使用的产出（文档、deck、设计稿、仪表盘、小型交互页）作为 artifact 放在对话旁；可从 Docs / Slides / Design 等模板起步，也可自由生成 HTML。Claude Code 可将会话输出发布为可更新的交互网页 artifact（例如带注释的 PR walkthrough）。Design 类可导出 zip、PDF、PowerPoint 或 **standalone HTML**。

**优势**  
- 与对话一体，迭代快；模板覆盖 deck/文档/设计。  
- Design 导出 standalone HTML，适合定稿带走。  
- Claude Code 文档明确支持把 PR walkthrough、dashboard、investigation timeline 做成 artifact。

**契合度：高**  
内容类型自适应强；单文件可通过 Design/下载 HTML 得到；团队分享：原生 Share 常要求对方有 Claude 账号（legacy 从 chat publish 是例外），故「发给任意同事」宜用导出 HTML。

**来源（抓取 2026-10-30）**  
- https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them  
- https://support.claude.com/en/articles/9547008-share-artifacts  
- https://code.claude.com/docs/en/artifacts  
- Netlify 关于 Claude HTML artifact 部署：https://www.netlify.com/knowledge-base/deploy-your-claude-artifacts-to-netlify/

**交叉核实**  
- 「Design 可 standalone HTML」：Claude Help Center View and export（来源 1）与 Netlify KB（来源 4）一致。  
- 「共享常需 Claude 账号」：Share artifacts 文写明 *Everyone needs a Claude account*；legacy chat publish 为例外。第三方 PreviewShip 指南亦写 native share 需登录、导出 HTML 可独立托管——与官方一致。

---

### 2. Anthropic skills：`frontend-design` + `web-artifacts-builder`

**是什么 / 做什么**  
官方 skills 仓库中的可复用指导：`frontend-design` 约束排版/配色/动效，避免「AI 默认审美」；`web-artifacts-builder` 用 React+TS+Vite+Tailwind+shadcn 初始化多文件前端，再用脚本 **bundle 成单个 `bundle.html`**（Parcel + html-inline）。Anthropic 文章说明两者分工：设计品味 vs 复杂 artifact 打包。

**优势**  
- 直接对准「按主题做不同视觉」与「最终单 HTML」。  
- 可迁移到其他 agent（skill 本质是按需加载的说明+脚本）。  
- 官方 cookbook/文章有落地路径。

**契合度：高**  
对 feature design（产品页/说明页）、code review（结构化 diff/卡片）、PR 摘要（多段仪表）都可通过不同布局指令实现；单文件是 skill 明确目标；文件可邮件/IM 直发。

**来源（抓取 2026-10-30）**  
- https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md（本地副本：`evidence/anthropic-skills-frontend.md`）  
- https://raw.githubusercontent.com/anthropics/skills/main/skills/web-artifacts-builder/SKILL.md（本地副本：`evidence/anthropic-skills-artifacts.md`）  
- https://claude.com/resources/articles/improving-frontend-design-through-skills  
- GitHub issue 澄清两者区别：https://github.com/anthropics/skills/issues/272  

**交叉核实**  
SKILL.md 原文与 Anthropic 官网文章对 stack、bundle 单文件、避免 AI slop 的描述一致。`license: Complete terms in LICENSE.txt`——完整 SPDX 条款未在本调研中展开核对，标 **未核实（完整许可证文本）**。

---

### 3. 自建「内容类型路由」skill / prompt → 单文件 HTML

**是什么 / 做什么**  
做法（非单一产品）：在 agent skill 中规定——先判定类型（`feature-design` | `pr` | `code-review` | …），再加载对应布局骨架（例如 review：严重度卡片+文件表+建议；design：问题/方案/序列图/验收；PR：变更摘要+风险+测试清单），最后输出 **一份自包含 HTML**（CSS/JS 内联，可选轻量动效）。可与选项 2 的 bundle 脚本或「纯 vanilla 单文件」结合。

**优势**  
- 最贴 Raymond 三类用例；可控、可版本化、不绑单一厂商 UI。  
- 输出即交付物，团队零账号。  
- 可逐步加类型，不必一次上 generative UI 平台。

**契合度：高**  
四项需求（自适应布局、单文件、团队分享、三类用例）均可直接写入 skill 验收标准。

**来源（抓取 2026-10-30）**  
- 模式依据：Anthropic Skills 设计说明（同上 frontend / artifacts-builder 文章与 SKILL.md）  
- Cursor 文档亦鼓励把常用 canvas 工作流打成 skill（布局/数据源/格式规则）：https://cursor.com/docs/agent/tools/canvas  

**交叉核实**  
「自建路由 skill」是工程做法，无独立 GitHub stars；成熟度体现在 Skills 机制与单文件 HTML 生态——依赖选项 1/2/6/8 的能力。无第二「产品主页」可交叉，故成熟度评分属推断，标 **未核实（作为独立产品的市场成熟度）**。

---

### 4. Cursor Canvas / Grok Bot Pages

**是什么 / 做什么**  
- **Cursor Canvas**：agent 在对话旁生成可交互 artifact（仪表盘、审计、报告），可 Publish 给团队只读链接（付费团队计划等条件）。  
- **Grok Bot Pages**：Bot 生成可读 Page（报告/看板等），Library 管理；Share 可选邀请、团队、或 **Anyone with the link**（`pages.grok.bot`，无需登录）。Enterprise 关闭公网分享。

**优势**  
- 与现有 Cursor/Grok Bot 工作流一体；适合快速把 agent 产出变成可读页。  
- Pages 公网链接对「发给同事」友好（非 Enterprise 时）。  
- Canvas 可用 skill 固化版式。

**契合度：中**  
自适应取决于 prompt/skill，非开箱按 content-type 路由。单文件：Pages/Canvas 以托管视图为主；论坛讨论称 `.canvas.tsx` 不宜当通用外发格式，外发需另存 HTML——**「一键导出单文件 HTML」未在官方 Pages/Canvas 文档中核实**。团队分享：Pages 较好；Canvas 分享限团队成员。

**来源（抓取 2026-10-30）**  
- https://cursor.com/docs/agent/tools/canvas  
- https://cursor.com/help/grok-bot/pages  
- 第三方关于 Canvas 外发 HTML 的讨论（非官方）：https://forum.cursor.com/t/canvas-should-be-a-generic-file-type-not-a-cursor-proprietary-format/169057  

**交叉核实**  
官方 Canvas「Publish 给团队」与 Pages「Anyone with the link」文档清晰。第三方「须另存 HTML 才能出团队外」与官方未写「导出 .html」并存——**冲突/缺口：官方未确认一键单文件导出；第三方说法标未完全核实。**

---

### 5. ChatGPT Sites（Canvas 已从现行模型移除）

**是什么 / 做什么**  
Sites：在 ChatGPT/Codex 里用描述构建、托管并分享网站/轻量应用。官方 Learn 文档覆盖 resource hub、dashboard、tracker 等模式。  
**冲突信息（并列表述，不强行裁决）：**  
- OpenAI Help / 多篇第三方称 **Canvas 已于 2026-05-28 从现行模型移除**，写作与代码改回聊天内块；付费用户曾可在 legacy 模型上短暂使用。  
- Sites 作为独立功能仍存在，可 Deploy/Share。  
- 另有第三方仍描述「从 Canvas Download HTML」——可能过时。

**优势**  
- 托管分享链路完整；适合做成小站而不是邮件附件。  
- 可按描述生成不同形态（看板/流程/计算器）。

**契合度：中**  
自适应中等；**本地单文件不是主路径**（偏托管 URL）；团队分享依赖 Sites 权限与 workspace 政策；对「塞进 IM 的一个 .html」弱于 Artifacts/skill bundle。

**来源（抓取 2026-10-30）**  
- https://learn.chatgpt.com/docs/sites  
- https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites  
- 第三方 Canvas 移除说明（需与官方 release notes 对照）：https://nos-workspace.com/learn/chatgpt-canvas-to-link  

**交叉核实**  
Sites 存在：Learn + Help Center 一致。Canvas 移除：多第三方一致称 2026-05；**本调研未成功打开完整官方 Model Release Notes 原文核对移除日期，标未核实（官方原文日期）**。本地 `evidence/chatgpt-sites.html` 抓取体积极小且未解析出正文关键词，可能被拦截——以 WebFetch 的 Learn 页为准。

---

### 6. reveal.js（+ Markdown / 独立 HTML 导出工具）

**是什么 / 做什么**  
成熟的 HTML 演示框架；可用 Markdown 插件、VS Code 扩展（如导出 Standalone HTML）、revelation/`orz-slides` 等从 MD 生成可浏览器打开的 deck。支持过渡与片段动画。

**优势**  
- 生态极成熟；MIT；可离线打开。  
- 适合「给团队讲一遍 PR / design」的 deck 形态。  
- 第三方工具明确支持 **assets 内联的 standalone HTML**。

**契合度：中**  
形态固定为幻灯片，不是「同一管道按类型换整页信息架构」；但对 code review 讲解、feature walkthrough 很合适；单文件与分享（发文件或静态托管）强。

**成熟度交叉核实（抓取 2026-10-30）**  
| 指标 | 来源 A | 来源 B |
|------|--------|--------|
| Stars | GitHub HTML 解析 ≈ **72,494**（`evidence/reveal-github.html`） | 搜索摘要约 72.4k |
| License | SPDX **MIT**（同页） | npm/官网亦称 MIT |
| 版本 | 搜索称 6.0.x（2026-09） | **未在本机打开 Releases 页二次确认最新 tag，次要信息标未核实** |

**来源**  
- https://github.com/hakimel/reveal.js/  
- https://revealjs.com/initialization/  
- VS Code SlideShow 独立 HTML 导出：https://marketplace.visualstudio.com/items?itemName=StarLorder123.slideshow  
- vscode-reveal selfContained：https://www.evilznet.com/vscode-reveal/guide/export  

---

### 7. Slidev

**是什么 / 做什么**  
面向开发者的 Markdown 幻灯片（Vue），`slidev build` 产出可托管 SPA；可 export PDF/PPTX/PNG。官方另有 MCP server 供 AI agent 读写幻灯片。

**优势**  
- MD 作者体验好、代码高亮与组件强，贴近工程内容。  
- MIT；stars 高。  
- 适合技术 walkthrough deck。

**契合度：中**  
与 reveal 类似偏 deck；单文件能力**有冲突**：

| 说法 | 来源 |
|------|------|
| 第三方称 `slidev build --base ./ --single-file` 可得单 HTML | Shipslides 博客 |
| PR #2633 拟加 `--standalone-bundle`，**被维护者关闭并拒绝合入**（认为过于复杂、应做通用 Vite 插件） | GitHub PR |
| **官方 CLI 文档未列出** `--single-file` / `--standalone-bundle` | https://sli.dev/builtin/cli （抓取正文无这些旗标） |

因此：**标准成熟路径是 build 出 `dist/` SPA 再托管**；「官方一等公民单文件 HTML」标 **未核实 / 与第三方冲突**。

**成熟度**  
- Stars：GitHub HTML ≈ **49,290**；搜索/BuildRadar 约 49.2k（2026-10-27）—一致量级。  
- License：SPDX **MIT**。

**来源（抓取 2026-10-30）**  
- https://github.com/slidevjs/slidev  
- https://sli.dev/guide/hosting.html  
- https://sli.dev/builtin/cli  
- https://github.com/slidevjs/slidev/pull/2633  
- https://shipslides.com/blog/share-slidev-deck-online  

---

### 8. Pandoc / Quarto（`embed-resources` 单文件 HTML）

**是什么 / 做什么**  
- **Pandoc**：通用文档转换；`--standalone --embed-resources` 生成无外链依赖的 HTML（`--self-contained` 为过时同义）。  
- **Quarto**：在 Pandoc 之上的出版系统；`format: html: embed-resources: true` 同样产出自包含 HTML 报告（TOC、代码块、tabset 等）。

**优势**  
- 文档/报告类极度成熟；适合长文 feature design、书面 review。  
- 真正「一个文件发给同事」。  
- 可用自定义模板/主题接近「类型化版式」，但需自己维护模板。

**契合度：中**（文档场景偏高，自适应场景偏低）  
默认**不会**按 content-type 智能换布局；要自适应需多套 template + 路由（回到选项 3）。对「炫酷 JS 动效页」弱于 Artifacts/skill。

**成熟度交叉核实**  
| | Pandoc | Quarto CLI |
|--|--------|------------|
| Stars | GitHub ≈ **46,751**；搜索约 46.6k | GitHub ≈ **6,138**；搜索约 6.1k |
| License | SPDX **GPL-2.0**；COPYRIGHT 亦写 GPL-2+ | 官网：v1.4+ **MIT**，更早 GPL-2；GitHub 页显示 `NOASSERTION`——**并列表述** |

**来源（抓取 2026-10-30）**  
- https://www.pandoc.org/MANUAL.html（`--embed-resources` / deprecated `--self-contained`）  
- https://github.com/jgm/pandoc  
- https://quarto.org/docs/output-formats/html-basics.html（Self Contained）  
- https://quarto.org/license  
- https://github.com/quarto-dev/quarto-cli  

---

### 9. Vercel json-render（及 AI SDK 集成）

**是什么 / 做什么**  
Generative UI 框架：模型在**预定义组件目录**内输出 JSON/JSONL，客户端 Renderer 渲染；可与 Vercel AI SDK 流式集成（Standalone / Inline）。强调 guardrail、跨 React/Vue 等。

**优势**  
- 「按意图生成不同 UI」正是自适应核心。  
- 目录约束比自由 HTML 更可控、可测。  
- Apache-2.0；仓库描述为 The Generative UI framework。

**契合度：低**（相对「单文件外发」目标）  
高自适应、但默认是**应用运行时**，不是邮件附件式 HTML。要做到单文件需另做静态导出管线——官方主文档路径未以「单 HTML 交付」为卖点。

**成熟度**  
- Stars：GitHub HTML ≈ **18,847**。  
- License：SPDX **Apache-2.0**。  
- WebFetch 首页曾显示 0 stars（抓取异常）vs 本地 HTML 18847——**以本地 `evidence/json-render-github.html` 与搜索为准；API 偶发 0 标未核实异常。**

**来源（抓取 2026-10-30）**  
- https://github.com/vercel-labs/json-render/  
- https://json-render.dev/docs/ai-sdk  

**相关：Vercel AI SDK generative UI / RSC**  
`streamUI` 等属 AI SDK RSC；文档称 RSC 路径实验性并引导迁到 AI SDK UI。适合产品内嵌，不适合单文件外发。来源：https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui  

---

### 10. CopilotKit + A2UI（Generative UI）

**是什么 / 做什么**  
面向 agent 的前端栈；generative UI 可接 A2UI 目录（文档称实现 A2UI 1.0，上游仍为 candidate）、标准组件库（布局/表/图等），经 AG-UI 协议把 agent 发出的 UI 操作渲染到 React/Angular 等。

**优势**  
- 与 agent 深度集成；组件化自适应强。  
- Stars 高（GitHub HTML ≈ **38,372**）；MIT。  
- Google Developers 博文将其与 A2UI 一并介绍，生态可见度高。

**契合度：低**（相对单文件分享）  
强在产品内 copilots；弱在「生成一个可转发的 .html」。A2UI 1.0 仍为 candidate、API 可能变——文档自述。

**来源（抓取 2026-10-30）**  
- https://github.com/CopilotKit/CopilotKit  
- https://docs.copilotkit.ai/generative-ui/components  
- https://developers.googleblog.com/build-generative-ui-apps-with-a2ui-copilotkit-agents/  

---

### 附：Marp（简记）

Marp CLI 可将 Markdown 转为演示 HTML（MIT，CLI stars ≈ **3,898**）。社区 issue 讨论「图片等资源是否完全内联」；常见建议是再经 Monolith 等工具做真正便携单文件。适合简单 deck，复杂自适应不如 skill+HTML。  
来源：https://marp.app/ 、https://github.com/marp-team/marp-cli/

---

## 推荐组合及优劣

### 推荐组合（面向 Raymond）

1. **主路径（日常交付）**  
   **内容类型路由 skill（选项 3）** + **`frontend-design` / `web-artifacts-builder` 或等价单文件打包（选项 2）**  
   → agent 识别 feature design / PR / code review → 选布局 → 输出 **一个自包含 HTML** → IM/邮件发给同事。

2. **迭代预览**  
   - 已在 Claude 生态：用 **Artifacts**（选项 1）边聊边改，定稿 Export/Download HTML。  
   - 已在 Cursor/Grok Bot：**Pages**（选项 4）快速成页；需要无登录外发时用 *Anyone with the link*（注意敏感信息与 Enterprise 限制）。

3. **讲解型补充**  
   需要站会演示时，用 **reveal.js**（选项 6）或 **Slidev SPA 托管**（选项 7，接受非单文件）从同一 markdown 源再导出 deck。

4. **长文书面稿**  
   用 **Quarto/Pandoc embed-resources**（选项 8）出正式单文件报告；版式用少量固定模板，不必上 generative UI。

5. **明确不优先**  
   仅当要做「产品内嵌 agent UI」时再评估 **json-render / CopilotKit**（选项 9–10）；它们不解决「发 HTML 文件」的主诉求。

### 优势

- 直接满足「按类型换形态 + 可分享单文件」。  
- 不强制同事注册 Claude/ChatGPT/Cursor（定稿走文件）。  
- 可渐进：先 vanilla 三套布局，再引入 React bundle skill。  
- Deck 与长文有成熟后备工具，不混用一条管道硬撑所有形态。

### 劣势 / 代价

- 需要维护 skill 与布局模板（工程投入，非买即用 SaaS）。  
- Claude 原生分享有账号墙；Sites/Pages 有平台与计划限制。  
- Slidev 单文件能力文档冲突，不能当「保证可双击打开」的唯一依赖。  
- Generative UI 库若强行用于外发，会引入构建与安全（可执行 HTML）成本。  
- 可执行 HTML 在企业环境可能被邮件网关拦截——或需内网静态托管（Netlify Drop 等），超出「纯附件」时要想清楚安全策略。

---

## 未核实清单

1. Anthropic skills 完整 SPDX/LICENSE.txt 正文条款。  
2. Slidev **官方**是否支持稳定的 `--single-file` / `--standalone-bundle`（第三方博客 vs 被拒 PR vs CLI 文档缺失——冲突保留）。  
3. ChatGPT Canvas **官方**移除公告原文中的精确日期与条款（多方称 2026-05-28；本调研未打开完整 release notes 页核对）。  
4. Cursor Canvas / Pages 是否提供官方「导出为自包含 .html」按钮。  
5. reveal.js / Slidev / Pandoc / Quarto / json-render **精确**实时 star 数（以 2026-10-30 抓取 HTML 为准，搜索摘要为约数）。  
6. Quarto GitHub `NOASSERTION` vs 官网「1.4+ MIT」——以官网许可证页为准记录，仓库元数据差异未深入。  
7. json-render WebFetch 曾返回 0 stars 的异常原因。  
8. 「自建内容类型路由 skill」作为独立产品的市场成熟度（做法成熟，产品化程度无独立指标）。  
9. Marp 默认 HTML 是否在无 Monolith 时对本地图片完全自包含（社区 issue 显示曾有缺口）。  
10. Claude Code artifact 公网分享是否在所有 Team/Enterprise 策略下默认可开（依赖 Owner 开关——策略细节未逐项核实）。

---

## 证据目录

本地只读抓取副本见：`/workspace/2026-10-30-adaptive-html-research/evidence/`  
（含 Anthropic SKILL.md、若干 GitHub/文档 HTML 快照。）
