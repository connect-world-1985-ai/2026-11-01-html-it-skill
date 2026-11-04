# Components: copy-ready building blocks

Every snippet uses only shell tokens (`var(--…)`) and works without JavaScript; scripts only enhance. Paste the CSS once into the page's `<style>` (after the shell CSS) and the script once before `</body>` (after the shell script). Rename nothing the shell's own script relies on: `.ref`, `.ref-id`, `.ref-summary`, `data-ref`, `data-gloss`, `#theme-toggle`, `#toc-list`.

## Ref chip + References entry

**Purpose:** turn an opaque ID into something a reader can follow. **Use:** every ID, ticket, finding number. Details in `cross-references.md`.

```html
<a class="ref" data-ref="KT-902" href="#ref-KT-902"><span class="ref-id">KT-902</span> vendor patch for the WildFly datasource</a>
…
<h2 id="references">References</h2>
<ol class="references">
  <li id="ref-KT-902"><b>KT-902</b> <span class="ref-summary">P1 bug: …one or two sentences…</span> Source: weekly status, 2026-11-06.</li>
</ol>
```

Unresolved: `<span class="ref" data-ref="X" data-ref-status="unresolved"><span class="ref-id">X</span> not found in the provided material</span>`.

## Glossary term

**Purpose:** define jargon where it first appears. **Use:** any term a new teammate might not know.

```html
<dfn data-gloss="A read model rebuilt from the event log for one screen or query.">projection</dfn>
```

Collect terms in `<h2 id="glossary">Glossary</h2><dl class="glossary"><dt>…</dt><dd>…</dd></dl>`.

## Callouts

**Purpose:** set apart a note, a warning or a decision. **Use:** sparingly; at most a few per page.

```html
<aside class="callout" data-kind="note"><p>…</p></aside>
<aside class="callout" data-kind="warn"><p><strong>Limit:</strong> votes stay in this browser.</p></aside>
<aside class="callout" data-kind="decision"><p><strong>Decision needed:</strong> Lena, by 7 November 2026.</p></aside>
```

## Status pill

**Purpose:** state at a glance, instead of emoji. **Use:** status, severity, verdicts.

```html
<span class="pill" data-state="ok">On track</span>
<span class="pill" data-state="warn">At risk</span>
<span class="pill" data-state="bad">Blocked</span>
<span class="pill" data-state="info">Draft</span>
```

The pill always carries a word; colour alone is not enough.

## Tabs

**Purpose:** parallel views of the same thing (per option, per platform). **Use:** when readers need one view at a time. Without JS every panel shows with its heading; printed, all panels print.

```html
<div class="tabs">
  <div role="tablist" aria-label="Options" hidden>
    <button role="tab" aria-selected="true" aria-controls="tab-a" id="t-a">Option A</button>
    <button role="tab" aria-selected="false" aria-controls="tab-b" id="t-b" tabindex="-1">Option B</button>
  </div>
  <section role="tabpanel" id="tab-a" aria-labelledby="t-a"><h3>Option A</h3><p>…</p></section>
  <section role="tabpanel" id="tab-b" aria-labelledby="t-b"><h3>Option B</h3><p>…</p></section>
</div>
```

```css
.tabs [role=tablist] { display: flex; gap: .25rem; border-bottom: 1px solid var(--line); margin-bottom: 1rem; }
.tabs [role=tab] { font: inherit; background: none; border: 0; border-bottom: 2px solid transparent; padding: .4rem .8rem; color: var(--muted); cursor: pointer; }
.tabs [role=tab][aria-selected=true] { color: var(--fg); border-color: var(--accent); }
.tabs.js [role=tabpanel] > h3:first-child { display: none; }
@media print { .tabs [role=tablist] { display: none !important; } .tabs [role=tabpanel] { display: block !important; } .tabs.js [role=tabpanel] > h3:first-child { display: block; } }
```

```js
document.querySelectorAll('.tabs').forEach((box) => {
  const list = box.querySelector('[role=tablist]'), tabs = [...list.querySelectorAll('[role=tab]')];
  list.hidden = false; box.classList.add('js');
  const select = (t) => tabs.forEach((x) => {
    const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on; if (on) x.focus();
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) select(tabs[(i + d + tabs.length) % tabs.length]);
    });
  });
  select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
});
```

## Disclosure

**Purpose:** keep long detail (raw logs, full tables) available but out of the way. **Use:** appendices and "more detail" sections; never for the main conclusion. Print expands it.

```html
<details><summary>Full terminal log (30 lines)</summary><pre><code>…</code></pre></details>
```

```css
details { border: 1px solid var(--line); border-radius: var(--radius); padding: .5rem .8rem; }
summary { cursor: pointer; font-weight: 600; }
```

## Annotated diff

**Purpose:** show the key change with explanations next to the lines. **Use:** PR write-ups, reviews. **The agent writes the colour spans; no highlighting library.** Added and removed lines keep their `+`/`-` sign so the meaning survives without colour.

```html
<pre class="diff" aria-label="Diff of BookingSearchService.java"><code><span class="ctx">  public List&lt;Slot&gt; search(Query q) {</span>
<span class="del">-    return query.offset(page * size).limit(size).fetch();</span>
<span class="add" id="L12">+    return query.where(cursor.after(lastStartTime, lastId))</span>
<span class="add">+                .limit(size + 1).fetch();</span></code></pre>
<p class="note" data-for="L12"><b>Line 12.</b> Keyset pagination: continues after the last row seen instead of skipping rows.</p>
```

```css
pre.diff { padding-inline: 0; }
pre.diff span { display: block; padding-inline: 1rem; }
pre.diff .add { background: var(--ok-bg); color: var(--fg); }
pre.diff .del { background: var(--bad-bg); color: var(--fg); }
pre.diff .ctx { color: var(--muted); }
.note { border-left: 2px solid var(--accent); padding-left: .7rem; color: var(--muted); font-size: .92rem; }
```

## Code block with pre-rendered highlighting

**Purpose:** readable code without a highlighter script. **Use:** any code excerpt. Wrap tokens yourself; the shell adds a Copy button to every `<pre>`.

```html
<pre><code><span class="tok-k">public</span> Booking <span class="tok-f">book</span>(BookingRequest req) {
    <span class="tok-c">// lock first, then check availability</span>
    <span class="tok-k">return</span> repository.<span class="tok-f">save</span>(<span class="tok-s">"x"</span>, <span class="tok-n">30</span>);
}</code></pre>
```

```css
.tok-k { color: var(--accent-ink); font-weight: 600; }
.tok-s { color: var(--ok); }
.tok-c { color: var(--muted); font-style: italic; }
.tok-n { color: var(--warn); }
.tok-f { color: var(--fg); text-decoration: underline dotted var(--line); }
```

Escape `<`, `>` and `&` inside code (`&lt;`, `&gt;`, `&amp;`).

## File tree

**Purpose:** show which files changed and how much. **Use:** PRs, walkthroughs, repository tours.

```html
<ul class="tree">
  <li>booking-api/src/main/java/…/booking/
    <ul>
      <li><code>BookingSearchService.java</code> <span class="chg" data-kind="mod">+65 −20</span></li>
      <li><code>V57__search_index.sql</code> <span class="chg" data-kind="add">new, +3</span></li>
    </ul>
  </li>
</ul>
```

```css
.tree, .tree ul { list-style: none; padding-left: 1.1rem; margin: 0; }
.tree { padding-left: 0; font-family: var(--mono); font-size: .9rem; }
.tree li { position: relative; padding: .1rem 0; }
.tree ul li::before { content: ""; position: absolute; left: -.8rem; top: .85em; width: .55rem; border-top: 1px solid var(--line); }
.chg { font-size: .8em; padding: 0 .35em; border-radius: 3px; background: var(--surface-2); color: var(--muted); }
.chg[data-kind=add] { background: var(--ok-bg); color: var(--ok); }
.chg[data-kind=del] { background: var(--bad-bg); color: var(--bad); }
```

## Timeline

**Purpose:** events in time order. **Use:** incidents, history, release trains. Times carry a time zone.

```html
<ol class="timeline">
  <li><time datetime="2026-10-29T09:12+01:00">09:12 CET</time> <p>Alert: booking API p95 latency 9.8 s (normal 0.4 s).</p></li>
  <li><time datetime="2026-10-29T09:15+01:00">09:15 CET</time> <p>On-call engineer acknowledges.</p></li>
</ol>
```

```css
.timeline { list-style: none; padding: 0; border-left: 2px solid var(--line); margin-left: .4rem; }
.timeline li { position: relative; padding: 0 0 1rem 1.2rem; }
.timeline li::before { content: ""; position: absolute; left: -.45rem; top: .45rem; width: .7rem; height: .7rem; border-radius: 50%; background: var(--accent); }
.timeline time { font-family: var(--mono); font-size: .85rem; color: var(--muted); }
.timeline p { margin: .1rem 0 0; }
```

## Stepper

**Purpose:** a real sequence the reader follows step by step. **Use:** setup guides, onboarding days, processes. All steps readable at rest and in print; JS adds previous/next.

```html
<ol class="stepper">
  <li><h3>Build locally</h3><p>…</p></li>
  <li><h3>Run the integration tests</h3><p>…</p></li>
</ol>
```

```css
.stepper { counter-reset: step; list-style: none; padding: 0; }
.stepper > li { counter-increment: step; position: relative; padding-left: 2.6rem; margin-bottom: 1.2rem; }
.stepper > li::before { content: counter(step); position: absolute; left: 0; top: .1rem; width: 1.8rem; height: 1.8rem; border-radius: 50%; display: grid; place-items: center; background: var(--surface-2); border: 1px solid var(--line); font-weight: 600; }
.stepper > li h3 { margin-top: 0; }
```

Optional enhancement: show one step at a time with Previous/Next buttons, but keep `@media print { .stepper > li { display: block !important; } }`.

## Comparison matrix

**Purpose:** options against criteria. **Use:** decisions, research comparisons. Sorting is optional JS; the table reads without it.

```html
<div class="table-wrap"><table class="matrix">
  <thead><tr><th scope="col">Option</th><th scope="col" data-sort="num">Effort (days)</th><th scope="col">Risk</th></tr></thead>
  <tbody>
    <tr><th scope="row">A: cron + retries</th><td>3</td><td><span class="pill" data-state="warn">Peak load stays</span></td></tr>
    <tr class="pick"><th scope="row">B: queue</th><td>20</td><td><span class="pill" data-state="ok">Low</span></td></tr>
  </tbody>
</table></div>
```

```css
.matrix tr.pick { background: var(--ok-bg); }
.matrix th[data-sort] { cursor: pointer; }
.matrix th[aria-sort=ascending]::after { content: " ▲"; } .matrix th[aria-sort=descending]::after { content: " ▼"; }
```

```js
document.querySelectorAll('table.matrix th[data-sort]').forEach((th) => th.addEventListener('click', () => {
  const tb = th.closest('table').tBodies[0], i = th.cellIndex, num = th.dataset.sort === 'num';
  const dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
  th.parentElement.querySelectorAll('th').forEach((x) => x.removeAttribute('aria-sort'));
  th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
  const val = (r) => { const t = r.cells[i].textContent.trim(); return num ? parseFloat(t) || 0 : t; };
  [...tb.rows].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * dir).forEach((r) => tb.append(r));
}));
```

## KPI row

**Purpose:** a few numbers that are the point of the page. **Use:** only when the numbers are the point; each carries a unit and a comparison.

```html
<div class="kpis">
  <div class="kpi"><span class="kpi-v">11.2 min</span><span class="kpi-l">Build time p50, down from 14.8 min</span></div>
</div>
```

```css
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: .8rem; margin-bottom: 1.5rem; }
.kpi { border: 1px solid var(--line); border-radius: var(--radius); padding: .7rem .9rem; background: var(--surface); }
.kpi-v { display: block; font-size: 1.5rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.kpi-l { color: var(--muted); font-size: .85rem; }
```

## Inline SVG chart (bar and line)

**Purpose:** show a comparison or trend. **Use:** numbers that change or compare. Drawn to scale: compute every bar length and point from the data and state the scale. Labels come from tokens via classes.

```html
<figure>
  <svg class="chart" viewBox="0 0 420 120" role="img" aria-labelledby="c1t">
    <title id="c1t">Build time p50: 14.8 min last week, 11.2 min this week</title>
    <!-- scale: 1 min = 20 px; 14.8 → 296 px, 11.2 → 224 px -->
    <text class="lbl" x="0" y="30">Week 44</text><rect class="bar muted" x="80" y="16" width="296" height="20"/><text class="val" x="382" y="31">14.8</text>
    <text class="lbl" x="0" y="70">Week 45</text><rect class="bar" x="80" y="56" width="224" height="20"/><text class="val" x="310" y="71">11.2</text>
    <line class="axis" x1="80" y1="90" x2="380" y2="90"/>
  </svg>
  <figcaption>Build time p50 in minutes.</figcaption>
</figure>
```

```css
svg.chart { width: 100%; height: auto; font: 12px var(--sans); }
svg.chart .bar { fill: var(--accent); } svg.chart .bar.muted { fill: var(--line); }
svg.chart .lbl, svg.chart .val { fill: var(--fg); } svg.chart .axis { stroke: var(--line); }
svg.chart .series { fill: none; stroke: var(--accent); stroke-width: 2; }
```

A line chart uses `<polyline class="series" points="x1,y1 x2,y2 …">` with the same scale comment.

## Inline SVG diagram skeleton

**Purpose:** structure or flow: architecture, chains of cause, state machines. **Use:** anything with boxes and arrows. Colours from `currentColor` and tokens; `role="img"` with a `<title>`; labels in plain language.

```html
<figure>
  <svg class="diagram" viewBox="0 0 560 90" role="img" aria-labelledby="d1t">
    <title id="d1t">Missing migration leads to a full table scan, an exhausted pool and slow bookings</title>
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g class="node"><rect x="0" y="20" width="120" height="50" rx="6"/><text x="60" y="50">Missing migration</text></g>
    <line class="edge" x1="120" y1="45" x2="148" y2="45" marker-end="url(#arr)"/>
    <g class="node"><rect x="150" y="20" width="120" height="50" rx="6"/><text x="210" y="50">Full table scan</text></g>
  </svg>
</figure>
```

```css
svg.diagram { width: 100%; height: auto; color: var(--muted); font: 13px var(--sans); }
svg.diagram .node rect { fill: var(--surface-2); stroke: var(--line); }
svg.diagram .node.hot rect { fill: var(--bad-bg); stroke: var(--bad); }
svg.diagram text { fill: var(--fg); text-anchor: middle; }
svg.diagram .edge { stroke: currentColor; stroke-width: 1.5; }
```

Wrap wide diagrams in `<div class="table-wrap">` or give them a narrower vertical layout for phones.

## Gallery board with isolated sketches

**Purpose:** compare many visual items without their CSS clashing. **Use:** UI sketches, variants. Each sketch is its own tiny HTML document inside `srcdoc`. Inside `srcdoc`, escape `&` as `&amp;` and `"` as `&quot;`. Use `sandbox="allow-scripts"` only if the sketch needs JS. Sketches must not load anything from the network either (the checker scans `srcdoc`).

```html
<div class="chips" role="group" aria-label="Filter sketches">
  <button class="chip" aria-pressed="true" data-tag="all">All</button>
  <button class="chip" aria-pressed="false" data-tag="booking">Booking</button>
  <button class="chip" id="compare-btn" aria-pressed="false">Compare two</button>
</div>
<div class="board">
  <figure class="sketch-card" data-tags="booking">
    <iframe class="sketch" title="Slot picker sketch" loading="lazy" sandbox
      srcdoc="&lt;!doctype html&gt;&lt;meta charset=&quot;utf-8&quot;&gt;&lt;style&gt;body{font:14px system-ui;margin:0;padding:12px}&lt;/style&gt;&lt;h1&gt;Pick a time&lt;/h1&gt;"></iframe>
    <figcaption><b>3. Slot picker.</b> Week strip on top; unavailable slots greyed.</figcaption>
  </figure>
</div>
```

```css
.chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
.chip { font: inherit; font-size: .85rem; border: 1px solid var(--line); background: var(--surface); color: var(--fg); border-radius: 999px; padding: .2rem .8rem; cursor: pointer; }
.chip[aria-pressed=true] { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 1rem; }
.sketch-card { margin: 0; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: .6rem; }
.sketch-card[hidden] { display: none; }
iframe.sketch { width: 100%; height: 460px; border: 1px solid var(--line); border-radius: 4px; background: #fff; }
.board.comparing { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.board.comparing .sketch-card:not(.picked) { display: none; }
```

```js
const board = document.querySelector('.board'), cards = [...board.querySelectorAll('.sketch-card')];
document.querySelectorAll('.chip[data-tag]').forEach((c) => c.addEventListener('click', () => {
  document.querySelectorAll('.chip[data-tag]').forEach((x) => x.setAttribute('aria-pressed', x === c));
  cards.forEach((k) => (k.hidden = c.dataset.tag !== 'all' && !k.dataset.tags.split(' ').includes(c.dataset.tag)));
}));
const cmp = document.getElementById('compare-btn');
cmp.addEventListener('click', () => {
  const on = cmp.getAttribute('aria-pressed') !== 'true'; cmp.setAttribute('aria-pressed', on);
  board.classList.toggle('comparing', on && board.querySelectorAll('.picked').length === 2);
});
cards.forEach((k) => k.querySelector('figcaption').addEventListener('click', () => {
  if (k.classList.contains('picked')) k.classList.remove('picked');
  else if (board.querySelectorAll('.picked').length < 2) k.classList.add('picked');
}));
```

Say in the page how compare mode works ("Click two captions, then Compare two"). The iframe background is a literal white because each sketch styles itself; that is the one allowed literal colour.

## Clickable prototype

**Purpose:** let people try a flow. **Use:** usability tests, stakeholder demos. Screens as states, hotspots, a small state machine, Reset, a notes panel, `location.hash` deep links. Without JS (and in print) all screens show in order.

```html
<div class="proto">
  <section data-screen="login" aria-label="Login"><h3>Sign in</h3><button data-go="email">Forgot password?</button></section>
  <section data-screen="email" aria-label="Enter email"><h3>Reset your password</h3><button data-go="login">Back</button></section>
</div>
<aside class="moderator" aria-label="Moderator controls">
  <button id="proto-reset">Reset to start</button>
  <label>Jump to <select id="proto-jump"></select></label>
</aside>
```

```css
.proto.js [data-screen] { display: none; } .proto.js [data-screen].on { display: block; }
.moderator { border: 1px dashed var(--line); padding: .6rem .8rem; border-radius: var(--radius); color: var(--muted); font-size: .9rem; }
@media print { .proto [data-screen] { display: block !important; break-after: page; } .moderator { display: none; } }
```

```js
const proto = document.querySelector('.proto'); proto.classList.add('js');
const screens = [...proto.querySelectorAll('[data-screen]')], first = screens[0].dataset.screen;
const show = (id) => { screens.forEach((s) => s.classList.toggle('on', s.dataset.screen === id)); history.replaceState(null, '', '#' + id); };
proto.addEventListener('click', (e) => { const go = e.target.closest('[data-go]'); if (go) show(go.dataset.go); });
const jump = document.getElementById('proto-jump');
screens.forEach((s) => jump.append(new Option(s.getAttribute('aria-label'), s.dataset.screen)));
jump.addEventListener('change', () => show(jump.value));
document.getElementById('proto-reset').addEventListener('click', () => { proto.querySelectorAll('input').forEach((i) => (i.value = '')); show(first); });
show(screens.some((s) => s.dataset.screen === location.hash.slice(1)) ? location.hash.slice(1) : first);
```

State visibly what is simulated ("No email is sent; this is a prototype").

## Deck mode

**Purpose:** present on a big screen. **Use:** reviews, talks. `<section class="slide">` elements; JS adds ←/→, Home/End, a slide counter, and `N` toggles speaker notes. Without JS or in print, slides are a scrolling document, one slide per printed page.

```html
<main class="deck">
  <section class="slide" id="s-1"><h1>Reminders: we recommend a queue</h1><p>…</p>
    <aside class="notes"><p>Open with the 6 % late figure.</p></aside></section>
  <section class="slide" id="s-2"><h2>Three options</h2>…</section>
</main>
<div class="deck-bar" hidden><span id="deck-count"></span> <span class="meta">← → to move, N for notes</span></div>
```

```css
.slide { min-height: 100vh; padding: 6vh 6vw; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; justify-content: center; }
.slide h1, .slide h2 { margin-top: 0; font-size: clamp(1.8rem, 1rem + 3vw, 3.2rem); }
.notes { display: none; border-top: 1px dashed var(--line); margin-top: 2rem; padding-top: .8rem; color: var(--muted); font-size: .95rem; }
body.show-notes .notes { display: block; }
body.deck-on .slide { display: none; border: 0; } body.deck-on .slide.on { display: flex; }
.deck-bar { position: fixed; bottom: .8rem; right: 1rem; font-size: .85rem; color: var(--muted); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: .2rem .6rem; }
@media print { body.deck-on .slide { display: flex !important; } .slide { min-height: auto; break-after: page; } .deck-bar { display: none !important; } .notes { display: block; } }
```

```js
const slides = [...document.querySelectorAll('.slide')], bar = document.querySelector('.deck-bar');
let cur = Math.max(0, slides.findIndex((s) => '#' + s.id === location.hash));
document.body.classList.add('deck-on'); bar.hidden = false;
const go = (i) => { cur = Math.min(slides.length - 1, Math.max(0, i)); slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  document.getElementById('deck-count').textContent = (cur + 1) + ' / ' + slides.length; history.replaceState(null, '', '#' + slides[cur].id); };
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) go(cur - 1);
  else if (e.key === 'Home') go(0); else if (e.key === 'End') go(slides.length - 1);
  else if (e.key.toLowerCase() === 'n') document.body.classList.toggle('show-notes');
});
go(cur);
```

A deck page hides the shell's topbar table of contents (`.page` without `has-toc`) and keeps the theme toggle.

## Small tool

**Purpose:** answer what-if questions live. **Use:** calculators, estimators, tuners. Inputs with labels, output that updates on `input`, a sensible example state at load.

```html
<form class="tool" oninput="out.value = (Number(events.value) / Number(every.value)).toFixed(0)">
  <label>Events per order <input id="events" name="events" type="number" value="1200" min="0"></label>
  <label>Snapshot every <input id="every" name="every" type="number" value="500" min="1"> events</label>
  <p>Snapshots per order: <output name="out" for="events every">2</output></p>
</form>
```

```css
.tool { display: grid; gap: .7rem; max-width: 28rem; padding: 1rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); }
.tool label { display: grid; gap: .2rem; font-size: .9rem; color: var(--muted); }
.tool input, .tool select { font: inherit; color: var(--fg); background: var(--bg); border: 1px solid var(--line); border-radius: 4px; padding: .35rem .5rem; }
.tool output { font-weight: 600; font-variant-numeric: tabular-nums; }
```

If the tool remembers anything (`localStorage`), say on the page that it is saved only in this browser.

## Copy-ready message

**Purpose:** a paste-ready text for a channel or email. **Use:** meeting notes, announcements. Put it in a `<pre>`; the shell adds the Copy button.

```html
<h2 id="post">Message for the team channel</h2>
<pre class="message"><code>Architecture sync 2026-11-03: two decisions…</code></pre>
```
