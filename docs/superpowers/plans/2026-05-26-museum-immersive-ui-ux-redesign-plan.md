# Museum Immersive UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing Chinese history timeline frontend into a premium museum-immersive, curator-style interface while removing search and preserving all existing timeline and annual controls.

**Architecture:** Keep the current Vite + vanilla JavaScript app. Add small pure helper modules for UI labels, remove the search path from HTML and JavaScript, then rebuild the CSS design system around dark museum surfaces, dynasty accents, responsive exhibit navigation, and reduced-motion support.

**Tech Stack:** Vite 8, vanilla JavaScript modules, CSS, Vitest, in-app browser verification.

---

## File Structure

- Modify `index.html`: remove search markup, add a contextual header status element, update section labels to exhibition language.
- Modify `src/js/main.js`: remove search DOM references and `setupSearch`, add status updates for active view/dynasty/year, use refined major-event markup.
- Create `src/js/ui-labels.js`: pure helper functions for status labels and major event badge HTML.
- Create `tests/ui-labels.test.js`: unit tests for helper output.
- Create `tests/ui-contract.test.js`: source-level contract checks for removed search UI and required header status.
- Create `tests/style-contract.test.js`: source-level contract checks for museum tokens, responsive rules, and reduced-motion support.
- Rewrite `src/css/style.css`: replace parchment card UI with the museum immersive design system and responsive layout.

## Task 1: Add Pure UI Label Helpers

**Files:**
- Create: `src/js/ui-labels.js`
- Create: `tests/ui-labels.test.js`

- [ ] **Step 1: Write failing tests for status labels and major-event markup**

Create `tests/ui-labels.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  getDynastyStatusText,
  getAnnualStatusText,
  getMajorEventBadgeHtml
} from '../src/js/ui-labels.js';

describe('ui label helpers', () => {
  it('formats dynasty status text for the exhibition header', () => {
    expect(getDynastyStatusText({ name: '汉', startYear: -202, endYear: 220 })).toBe('当前展线：汉');
  });

  it('falls back when no dynasty is active yet', () => {
    expect(getDynastyStatusText()).toBe('沿时间展线浏览');
  });

  it('formats annual status text for the archive header', () => {
    expect(getAnnualStatusText(25)).toBe('年度档案：公元 25 年');
  });

  it('returns an empty badge for non-major events', () => {
    expect(getMajorEventBadgeHtml(false)).toBe('');
  });

  it('returns refined major-event markup without star glyphs', () => {
    const html = getMajorEventBadgeHtml(true);
    expect(html).toContain('major-badge');
    expect(html).toContain('重大');
    expect(html).not.toContain('★');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm run test -- tests/ui-labels.test.js
```

Expected: FAIL because `src/js/ui-labels.js` does not exist.

- [ ] **Step 3: Implement the helper module**

Create `src/js/ui-labels.js`:

```js
export function getDynastyStatusText(era) {
  if (!era || !era.name) {
    return '沿时间展线浏览';
  }
  return `当前展线：${era.name}`;
}

export function getAnnualStatusText(year) {
  return `年度档案：公元 ${year} 年`;
}

export function getMajorEventBadgeHtml(isMajor) {
  if (!isMajor) {
    return '';
  }
  return '<span class="major-badge" aria-label="重大事件">重大</span>';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm run test -- tests/ui-labels.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the helper task**

```bash
git add src/js/ui-labels.js tests/ui-labels.test.js
git commit -m "test: add ui label helpers"
```

## Task 2: Remove Search And Add Header Status Contract

**Files:**
- Create: `tests/ui-contract.test.js`
- Modify: `index.html`
- Modify: `src/js/main.js`

- [ ] **Step 1: Write failing source contract tests**

Create `tests/ui-contract.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const mainJs = readFileSync('src/js/main.js', 'utf8');

describe('museum redesign source contract', () => {
  it('removes the old global search UI from the document', () => {
    expect(html).not.toContain('global-search-container');
    expect(html).not.toContain('search-bar');
    expect(html).not.toContain('search-input');
  });

  it('adds a contextual header status element', () => {
    expect(html).toContain('id="header-status"');
    expect(html).toContain('class="header-status"');
  });

  it('removes search behavior from the main module', () => {
    expect(mainJs).not.toContain('setupSearch');
    expect(mainJs).not.toContain('searchContainer');
    expect(mainJs).not.toContain('search-bar');
  });
});
```

- [ ] **Step 2: Run contract tests to verify they fail**

Run:

```bash
npm run test -- tests/ui-contract.test.js
```

Expected: FAIL because search markup and search logic still exist.

- [ ] **Step 3: Update the header markup**

In `index.html`, replace the full `<header>...</header>` block with:

```html
  <header class="museum-header">
    <div class="header-logo" aria-label="应用标识">
      <div class="header-seal" id="app-seal">史</div>
      <div>
        <p class="header-kicker">数字历史展厅</p>
        <h1 class="header-title">中华编年长卷</h1>
      </div>
    </div>

    <nav class="view-selector" aria-label="视图切换">
      <button class="view-tab-btn active" id="btn-dynasty-view" type="button">朝代长卷</button>
      <button class="view-tab-btn" id="btn-annual-view" type="button">纪年史记</button>
    </nav>

    <div class="header-status" id="header-status" aria-live="polite">沿时间展线浏览</div>
  </header>
```

Also update these labels in `index.html`:

```html
<h2 class="axis-header">朝代展线</h2>
<h2 class="axis-header">年度检索台</h2>
```

Expected: the old search SVG and input are gone; the header has a status region.

- [ ] **Step 4: Remove search setup from JavaScript**

In `src/js/main.js`, remove this DOM reference:

```js
const searchContainer = document.getElementById('global-search-container');
```

Remove this call from `initApp`:

```js
setupSearch();
```

Delete the entire `setupSearch` function.

In `setupViewSwitching`, remove both search visibility lines:

```js
searchContainer.classList.remove('hidden');
searchContainer.classList.add('hidden');
```

- [ ] **Step 5: Run contract tests to verify they pass**

Run:

```bash
npm run test -- tests/ui-contract.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the search removal task**

```bash
git add index.html src/js/main.js tests/ui-contract.test.js
git commit -m "feat: remove search and add exhibit status"
```

## Task 3: Wire Header Status And Refined Annual Markup

**Files:**
- Modify: `src/js/main.js`
- Modify: `tests/ui-labels.test.js`

- [ ] **Step 1: Extend tests to protect status helper usage assumptions**

Append this test to `tests/ui-labels.test.js`:

```js
it('keeps annual status stable for string-compatible years', () => {
  expect(getAnnualStatusText('200')).toBe('年度档案：公元 200 年');
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test -- tests/ui-labels.test.js
```

Expected: PASS. This confirms the helper is safe for numeric input coercion already used in the app.

- [ ] **Step 3: Import helpers and add header status reference**

At the top of `src/js/main.js`, replace:

```js
import { formatYear } from './utils.js';
```

with:

```js
import { formatYear } from './utils.js';
import {
  getAnnualStatusText,
  getDynastyStatusText,
  getMajorEventBadgeHtml
} from './ui-labels.js';
```

After:

```js
const appSeal = document.getElementById('app-seal');
```

add:

```js
const headerStatus = document.getElementById('header-status');
```

- [ ] **Step 4: Add a small status update helper**

Add this function after `updateGlobalTheme`:

```js
function updateHeaderStatus(text) {
  if (headerStatus) {
    headerStatus.textContent = text;
  }
}
```

- [ ] **Step 5: Update dynasty and annual statuses**

Inside `activateNode`, after `updateGlobalTheme(themeColor);`, add:

```js
  const activeEra = historyData.find(era => era.id === id);
  updateHeaderStatus(getDynastyStatusText(activeEra));
```

Inside the dynasty tab click handler in `setupViewSwitching`, after showing the dynasty view, add:

```js
    const activeEra = historyData.find(era => era.id === currentActiveId);
    updateHeaderStatus(getDynastyStatusText(activeEra));
```

Inside the annual tab click handler in `setupViewSwitching`, before `syncAnnualYear(selectedYear);`, add:

```js
    updateHeaderStatus(getAnnualStatusText(selectedYear));
```

Inside `syncAnnualYear`, after `selectedYear = year;`, add:

```js
  if (activeView === 'annual') {
    updateHeaderStatus(getAnnualStatusText(year));
  }
```

- [ ] **Step 6: Replace major event badge markup**

In `renderAnnualEvents`, replace:

```js
      const majorBadgeHtml = event.isMajor ? `<span class="major-badge">★ 重大事件</span>` : '';
```

with:

```js
      const majorBadgeHtml = getMajorEventBadgeHtml(event.isMajor);
```

- [ ] **Step 7: Run helper and contract tests**

Run:

```bash
npm run test -- tests/ui-labels.test.js tests/ui-contract.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit the status wiring task**

```bash
git add src/js/main.js tests/ui-labels.test.js
git commit -m "feat: wire exhibit status labels"
```

## Task 4: Rebuild Museum Visual System CSS

**Files:**
- Create: `tests/style-contract.test.js`
- Modify: `src/css/style.css`

- [ ] **Step 1: Write failing style contract tests**

Create `tests/style-contract.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/css/style.css', 'utf8');

describe('museum visual system css contract', () => {
  it('defines dark museum design tokens', () => {
    expect(css).toContain('--bg-void');
    expect(css).toContain('--surface-glass');
    expect(css).toContain('--text-ivory');
    expect(css).toContain('--bronze');
  });

  it('styles the exhibit header and status region', () => {
    expect(css).toContain('.museum-header');
    expect(css).toContain('.header-status');
  });

  it('supports mobile stacked navigation', () => {
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('grid-template-columns: 1fr');
  });

  it('respects reduced motion preferences', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation: none');
    expect(css).toContain('transition: none');
  });
});
```

- [ ] **Step 2: Run style tests to verify they fail**

Run:

```bash
npm run test -- tests/style-contract.test.js
```

Expected: FAIL because the old parchment CSS does not define the new museum tokens.

- [ ] **Step 3: Replace the top-level CSS tokens and base shell**

In `src/css/style.css`, replace the existing `:root`, global reset, `body`, `body::before`, and header-related rules through `.search-icon` with this museum shell:

```css
:root {
  --bg-void: #080908;
  --bg-ink: #101211;
  --bg-charcoal: #171412;
  --surface-glass: rgba(246, 236, 214, 0.075);
  --surface-strong: rgba(246, 236, 214, 0.115);
  --surface-quiet: rgba(255, 255, 255, 0.045);
  --line-warm: rgba(239, 226, 199, 0.14);
  --line-bright: rgba(239, 226, 199, 0.24);
  --text-ivory: #f5ecd8;
  --text-soft: #cfc0a6;
  --text-muted: #8d806d;
  --bronze: #d7ad62;
  --vermillion: #b43b31;
  --cool-slate: #6f91a6;
  --accent-theme: #b2584b;
  --accent-glow: rgba(178, 88, 75, 0.16);
  --font-serif: 'Noto Serif SC', 'Georgia', serif;
  --font-sans: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --shadow-display: 0 24px 80px rgba(0, 0, 0, 0.38);
  --shadow-soft: 0 12px 36px rgba(0, 0, 0, 0.26);
  --radius-panel: 18px;
  --radius-card: 16px;
  --transition-smooth: 240ms ease;
  --transition-theme: background-color 700ms ease, border-color 700ms ease, color 240ms ease, box-shadow 700ms ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background: var(--bg-void);
}

body {
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--text-ivory);
  font-family: var(--font-sans);
  line-height: 1.6;
  background:
    radial-gradient(circle at 18% 8%, color-mix(in srgb, var(--accent-theme) 26%, transparent), transparent 32%),
    radial-gradient(circle at 82% 10%, rgba(215, 173, 98, 0.16), transparent 30%),
    linear-gradient(135deg, var(--bg-void), var(--bg-ink) 42%, var(--bg-charcoal));
  transition: var(--transition-theme);
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at 50% 20%, black, transparent 78%);
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(245, 236, 216, 0.08), transparent 46%);
  mix-blend-mode: screen;
}

button,
input {
  font: inherit;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--bronze);
  outline-offset: 3px;
}

.museum-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(180px, 1fr);
  align-items: center;
  gap: 18px;
  padding: 16px clamp(18px, 5vw, 64px);
  border-bottom: 1px solid var(--line-warm);
  background: rgba(8, 9, 8, 0.78);
  backdrop-filter: blur(18px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.26);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-seal {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--accent-theme);
  color: #fff6e3;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 0 24px var(--accent-glow);
  transition: var(--transition-theme);
}

.header-kicker {
  color: var(--bronze);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.header-title {
  color: var(--text-ivory);
  font-family: var(--font-serif);
  font-size: 21px;
  font-weight: 900;
  letter-spacing: 0;
  white-space: nowrap;
}

.header-status {
  justify-self: end;
  max-width: 100%;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border: 1px solid var(--line-warm);
  border-radius: 999px;
  color: var(--text-soft);
  background: var(--surface-quiet);
  font-size: 13px;
  white-space: nowrap;
}
```

- [ ] **Step 4: Replace the main layout and dynasty card sections**

Replace existing rules for `.app-container`, `.axis-elevator`, `.axis-header`, `.axis-nodes-container`, `.axis-nodes-line`, `.axis-node-btn`, `.chronicle-stream`, `.dynasty-card`, `.dynasty-card.visible`, `.dynasty-card::before`, `.dyn-header`, `.dyn-titles`, `.dyn-name`, `.dyn-meta`, `.dyn-badge`, `.dyn-desc`, `.milestone-axis`, `.milestone-node`, `.milestone-node::before`, `.milestone-year`, `.milestone-title`, `.milestone-desc`, `.concurrency-grid`, `.concurrency-col`, `.concurrency-col::before`, `.state-title`, `.state-meta`, and `.state-desc` with:

```css
.app-container {
  position: relative;
  z-index: 1;
  width: min(1220px, calc(100% - 40px));
  margin: 42px auto;
  display: flex;
  gap: 34px;
}

.axis-elevator {
  width: 250px;
  flex: 0 0 250px;
  position: sticky;
  top: 96px;
  height: calc(100vh - 126px);
  padding: 22px 18px;
  border: 1px solid var(--line-warm);
  border-radius: var(--radius-panel);
  background: var(--surface-glass);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.axis-header {
  color: var(--bronze);
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0;
  margin-bottom: 20px;
}

.axis-nodes-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100% - 42px);
  overflow-y: auto;
  padding: 2px 4px 2px 0;
}

.axis-nodes-line {
  position: absolute;
  left: 7px;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--line-bright), transparent);
}

.axis-node-btn {
  position: relative;
  min-height: 34px;
  padding: 7px 8px 7px 24px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-serif);
  font-size: 13px;
  transition: var(--transition-smooth);
}

.axis-node-btn::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 50%;
  width: 9px;
  height: 9px;
  border: 1px solid var(--line-bright);
  border-radius: 50%;
  background: var(--bg-ink);
  transform: translateY(-50%);
  transition: var(--transition-smooth);
}

.axis-node-btn:hover,
.axis-node-btn.active {
  color: var(--text-ivory);
  border-color: color-mix(in srgb, var(--accent-theme) 38%, transparent);
  background: color-mix(in srgb, var(--accent-theme) 12%, transparent);
}

.axis-node-btn.active::before {
  border-color: var(--accent-theme);
  background: var(--accent-theme);
  box-shadow: 0 0 18px var(--accent-theme);
}

.chronicle-stream {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 34px;
  min-width: 0;
  padding-bottom: 90px;
}

.dynasty-card {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 4vw, 38px);
  border: 1px solid color-mix(in srgb, var(--accent-color, var(--accent-theme)) 24%, var(--line-warm));
  border-radius: var(--radius-card);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-color, var(--accent-theme)) 12%, transparent), transparent 34%),
    var(--surface-glass);
  box-shadow: var(--shadow-display);
  backdrop-filter: blur(20px);
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 520ms ease, transform 520ms ease, border-color 700ms ease, box-shadow 700ms ease;
}

.dynasty-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.dynasty-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: linear-gradient(180deg, var(--accent-color, var(--accent-theme)), var(--bronze));
  box-shadow: 0 0 28px color-mix(in srgb, var(--accent-color, var(--accent-theme)) 48%, transparent);
}

.dynasty-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, rgba(255,255,255,0.07), transparent 28%);
}

.dyn-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  padding-bottom: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--line-warm);
}

.dyn-name {
  color: var(--text-ivory);
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.15;
}

.dyn-meta {
  margin-top: 8px;
  color: var(--text-soft);
  font-size: 13px;
}

.dyn-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 5px 11px;
  border: 1px solid color-mix(in srgb, var(--accent-color, var(--accent-theme)) 55%, var(--line-bright));
  border-radius: 999px;
  color: var(--text-ivory);
  background: color-mix(in srgb, var(--accent-color, var(--accent-theme)) 18%, transparent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.dyn-desc {
  position: relative;
  z-index: 1;
  margin-bottom: 26px;
  max-width: 72ch;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.85;
}

.milestone-axis {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 18px;
  margin-left: 7px;
  padding-left: 24px;
  border-left: 1px solid var(--line-warm);
}

.milestone-node {
  position: relative;
  padding: 14px 16px;
  border: 1px solid var(--line-warm);
  border-radius: 14px;
  background: var(--surface-quiet);
}

.milestone-node::before {
  content: '';
  position: absolute;
  left: -31px;
  top: 22px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--accent-color, var(--accent-theme));
  background: var(--bg-ink);
  box-shadow: 0 0 16px color-mix(in srgb, var(--accent-color, var(--accent-theme)) 40%, transparent);
}

.milestone-year {
  color: var(--bronze);
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 4px;
}

.milestone-title {
  color: var(--text-ivory);
  font-family: var(--font-serif);
  font-size: 16px;
  margin-bottom: 6px;
}

.milestone-desc {
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.65;
}

.concurrency-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.concurrency-col {
  position: relative;
  overflow: hidden;
  min-height: 150px;
  padding: 18px;
  border: 1px solid var(--line-warm);
  border-radius: 14px;
  background: var(--surface-quiet);
}

.concurrency-col::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: var(--state-color);
}

.state-title {
  color: var(--text-ivory);
  font-family: var(--font-serif);
  font-size: 17px;
  margin-bottom: 5px;
}

.state-meta {
  color: var(--bronze);
  font-size: 12px;
  margin-bottom: 10px;
}

.state-desc {
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.6;
}
```

- [ ] **Step 5: Replace view selector and annual-control CSS**

Replace the existing `.hidden`, `.view-selector`, `.view-tab-btn`, annual layout, annual selector, year input, slider, century, annual event, tag, and major event rules with:

```css
.hidden {
  display: none !important;
}

.view-selector {
  justify-self: center;
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  border: 1px solid var(--line-warm);
  border-radius: 999px;
  background: var(--surface-quiet);
}

.view-tab-btn {
  min-height: 36px;
  padding: 7px 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 800;
  transition: var(--transition-smooth);
}

.view-tab-btn:hover,
.view-tab-btn.active {
  color: var(--text-ivory);
  background: color-mix(in srgb, var(--accent-theme) 20%, rgba(255,255,255,0.04));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-theme) 36%, transparent);
}

#annual-view-container {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.annual-selector-panel {
  position: sticky;
  top: 96px;
  padding: 22px;
  border: 1px solid var(--line-warm);
  border-radius: var(--radius-panel);
  background: var(--surface-glass);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(18px);
}

.panel-label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-soft);
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 800;
}

.year-search-block,
.year-slider-block {
  margin-bottom: 26px;
}

.year-input-row {
  display: grid;
  grid-template-columns: minmax(58px, auto) 1fr minmax(58px, auto);
  gap: 8px;
}

.year-step-btn,
.century-btn {
  min-height: 36px;
  border: 1px solid var(--line-warm);
  border-radius: 999px;
  background: var(--surface-quiet);
  color: var(--text-soft);
  cursor: pointer;
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 800;
  transition: var(--transition-smooth);
}

.year-step-btn:hover,
.century-btn:hover,
.century-btn.active {
  border-color: color-mix(in srgb, var(--accent-theme) 50%, var(--line-bright));
  color: var(--text-ivory);
  background: color-mix(in srgb, var(--accent-theme) 18%, transparent);
}

.year-num-input {
  width: 100%;
  min-height: 42px;
  border: 1px solid var(--line-warm);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-ivory);
  text-align: center;
  font-size: 19px;
  font-weight: 900;
}

.year-range-slider {
  width: 100%;
  accent-color: var(--accent-theme);
  cursor: pointer;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 10px;
}

.quick-title {
  margin-bottom: 12px;
  color: var(--bronze);
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 900;
}

.quick-centuries .century-btns-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
  max-height: 210px;
  overflow-y: auto;
  padding-right: 2px;
}

.annual-compare-main,
.single-col-layout {
  min-width: 0;
  width: 100%;
  max-width: 900px;
}

.annual-events-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.annual-event-row {
  position: relative;
  padding: 18px 20px 18px 22px;
  border: 1px solid var(--line-warm);
  border-radius: 14px;
  background: var(--surface-quiet);
  transition: var(--transition-smooth);
}

.annual-event-row::before {
  content: '';
  position: absolute;
  inset: 14px auto 14px 0;
  width: 3px;
  border-radius: 999px;
  background: var(--accent-theme);
}

.event-row-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.event-row-title {
  color: var(--text-ivory);
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 1.35;
}

.event-row-tag,
.major-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 24px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
}

.event-row-desc {
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.75;
}

.tag-regime,
.tag-battle { background: rgba(180, 59, 49, 0.18); color: #f0a096; }
.tag-livelihood,
.tag-calendar,
.tag-architecture { background: rgba(215, 173, 98, 0.16); color: #e7c47f; }
.tag-poetry,
.tag-classics { background: rgba(111, 145, 166, 0.18); color: #a9c7d7; }
.tag-influx { background: rgba(137, 116, 163, 0.2); color: #d1b7ea; }
.tag-technology,
.tag-exam { background: rgba(92, 135, 158, 0.2); color: #acd0e1; }
.tag-trade,
.tag-diplomacy { background: rgba(201, 146, 61, 0.18); color: #edc16b; }

.annual-event-row.major-event {
  border-color: color-mix(in srgb, var(--accent-theme) 45%, var(--line-bright));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-theme) 14%, transparent), transparent 58%),
    var(--surface-strong);
  box-shadow: 0 16px 42px color-mix(in srgb, var(--accent-theme) 16%, transparent);
}

.annual-event-row.major-event::before {
  width: 5px;
  background: linear-gradient(180deg, var(--accent-theme), var(--bronze));
}

.major-badge {
  margin-right: 8px;
  border: 1px solid color-mix(in srgb, var(--accent-theme) 55%, var(--line-bright));
  color: var(--text-ivory);
  background: color-mix(in srgb, var(--accent-theme) 24%, transparent);
}
```

- [ ] **Step 6: Replace responsive and reduced-motion rules**

At the end of `src/css/style.css`, replace existing responsive rules with:

```css
@media (max-width: 992px) {
  .museum-header {
    grid-template-columns: 1fr;
    justify-items: stretch;
    gap: 12px;
  }

  .view-selector {
    justify-self: stretch;
  }

  .view-tab-btn {
    flex: 1;
  }

  .header-status {
    justify-self: stretch;
    justify-content: center;
  }

  .app-container {
    width: min(100% - 28px, 860px);
    gap: 22px;
  }

  #annual-view-container {
    grid-template-columns: 1fr;
  }

  .annual-selector-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .museum-header {
    padding: 14px;
  }

  .header-title {
    font-size: 19px;
  }

  .app-container {
    flex-direction: column;
    margin: 24px auto;
    width: calc(100% - 24px);
  }

  .axis-elevator {
    position: sticky;
    top: 132px;
    z-index: 80;
    width: 100%;
    height: auto;
    flex-basis: auto;
    padding: 14px;
  }

  .axis-header {
    margin-bottom: 10px;
  }

  .axis-nodes-container {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    gap: 10px;
    padding-bottom: 4px;
  }

  .axis-nodes-line {
    display: none;
  }

  .axis-node-btn {
    flex: 0 0 auto;
    max-width: 190px;
    white-space: nowrap;
  }

  .dyn-header,
  .event-row-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dyn-badge,
  .event-row-tag {
    align-self: flex-start;
  }

  .year-input-row {
    grid-template-columns: 1fr;
  }

  .quick-centuries .century-btns-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-height: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }

  .dynasty-card {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 7: Run style tests**

Run:

```bash
npm run test -- tests/style-contract.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit the visual system task**

```bash
git add src/css/style.css tests/style-contract.test.js
git commit -m "feat: apply museum visual system"
```

## Task 5: Build And Browser Verification

**Files:**
- Modify only if verification reveals a defect: `index.html`, `src/js/main.js`, `src/css/style.css`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all Vitest tests PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build completes successfully and writes `dist/`.

- [ ] **Step 3: Start the app for browser verification**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL like `http://127.0.0.1:3000/history2000/`.

- [ ] **Step 4: Verify desktop in the browser**

Open the local Vite URL at a desktop viewport. Check:

- Header shows seal, title, two view buttons, and status text.
- No search input or search icon appears.
- Dynasty cards render as dark display-case panels.
- Left dynasty exhibit line is sticky and legible.
- Scrolling updates the active dynasty node and header status.

- [ ] **Step 5: Verify annual mode in the browser**

Click `纪年史记`. Check:

- Header status changes to `年度档案：公元 25 年`.
- Annual selector panel appears as a control console.
- `+1 年`, `-1 年`, slider, manual year input, and century buttons still update the archive.
- Major event labels show `重大` and do not show a star glyph.

- [ ] **Step 6: Verify mobile layout in the browser**

Resize to a mobile viewport. Check:

- Header stacks without overlap.
- View selector buttons fit.
- Dynasty exhibit line scrolls horizontally.
- Dynasty cards and annual event rows wrap text cleanly.
- Year controls do not overflow.

- [ ] **Step 7: Fix any verification defects**

If a browser defect appears, make the smallest targeted change. Examples:

```css
.header-status {
  white-space: normal;
  text-align: center;
}
```

or:

```css
.event-row-title {
  overflow-wrap: anywhere;
}
```

After any fix, rerun:

```bash
npm run test
npm run build
```

Expected: both commands PASS.

- [ ] **Step 8: Commit final verification fixes**

If no fixes were needed:

```bash
git status --short
```

Expected: clean except known untracked `.superpowers/` if still present.

If fixes were needed:

```bash
git add index.html src/js/main.js src/css/style.css
git commit -m "fix: polish museum responsive layout"
```

## Self-Review

- Spec coverage: The plan removes search, adds contextual status, keeps both views, preserves annual controls, rebuilds the dark museum visual system, adds responsive behavior, includes reduced-motion handling, and requires build plus browser verification.
- Placeholder scan: No placeholder markers or vague implementation instructions remain.
- Type consistency: Helper names are defined in Task 1 and imported with matching names in Task 3. Contract tests reference concrete files and strings.
