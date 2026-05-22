# Design Spec: 中华历史二千年时间轴深度整理与重大事件高亮设计

- **Date:** 2026-05-22
- **Topic:** 中华历史时间轴深度整理 (1 AD - 2000 AD)
- **Status:** Approved by User

---

## 1. 概述与背景

当前项目中包含 1 到 20 世纪的年度编年史数据（`src/data/timeline/century-1.json` 至 `century-20.json`）。经过前期分析发现，现有数据中 **96.15% (3846 / 4000 个事件)** 为高度重复的占位符/模板数据（例如频繁重复“时期历史纪要”、“丝绸之路与民间互市”等）。

为了将该项目打造成全方位、深度展示中华历史的高端时间轴应用，我们将对这 2,000 年的历史数据进行**深度的史学整理**。

### 核心改进目标：
1. **真实史料重塑：** 参照吕思勉《中国通史》、钱穆《国史大纲》、白寿彝主编《中国通史》、司马光《资治通鉴》、司马迁《史记》、《明史》、《清史稿》等权威史籍，将所有占位符数据替换为高精度、富有史实细节的年度大事记。
2. **分类全面中文化：** 将 JSON 中的 `category` 字段直接改为中文（例如将 `"regime"` 改为 `"政权更迭"`）。
3. **重大事件标识与高亮：** 为关键历史转折点事件增加 `"isMajor": true` 标志，并在前端界面以极具质感的“帝王金”视觉效果呈现。

---

## 2. 详细设计

### 2.1 JSON 数据 Schema 变更

原 Schema：
```json
{
  "title": "王莽加封安汉公",
  "category": "regime",
  "desc": "王莽被拜为太傅，受封‘安汉公’，开始总揽朝政，西汉权力逐渐向王莽倾斜。"
}
```

新 Schema：
```json
{
  "title": "王莽加封安汉公",
  "category": "政权更迭",
  "desc": "王莽被拜为太傅，受封‘安汉公’，开始总揽朝政，西汉权力逐渐向王莽倾斜。",
  "isMajor": true
}
```

#### 分类对照表（中文直接写入 JSON）：
| 英文标识 (CSS 用) | 中文标识 (JSON 写入) | 说明 |
| :--- | :--- | :--- |
| `regime` | `政权更迭` | 皇帝登基、朝代交替、中枢政变 |
| `battle` | `军事战役` | 著名战争、平叛、对峙战役 |
| `livelihood` | `社会民生` | 户口普查、自然灾害、税收赈灾 |
| `calendar` | `历法天象` | 历法改制、超新星/彗星天象记录 |
| `poetry` | `诗词文学` | 著名诗篇、辞赋、文学名家活动 |
| `architecture` | `古建工程` | 都城营建、运河长城修筑、宫殿圜丘 |
| `influx` | `文化交流` | 佛教西来、玄奘西行、中外思想融合 |
| `technology` | `科技发明` | 造纸术、水排冶铁、火药指南针、滑翔试验 |
| `exam` | `科举儒典` | 太学扩建、科举创立、五经正义编撰 |
| `trade` | `商业贸易` | 币制改革、丝路互市、交子发行 |
| `diplomacy` | `外交朝贡` | 归附内徙、尼布楚条约、张骞出使 |
| `classics` | `典籍编撰` | 史记/资治通鉴撰写、古文经释义 |

---

### 2.2 前端 JavaScript 逻辑适配 (`src/js/main.js`)

为了保持原有的 CSS 样式渲染，我们需要在 JS 中引入中英对照映射，以便在 DOM 中输出正确的 CSS 类名：

```javascript
// 中文分类到 CSS 类名的映射
const CATEGORY_TO_CLASS = {
  '政权更迭': 'regime',
  '军事战役': 'battle',
  '社会民生': 'livelihood',
  '历法天象': 'calendar',
  '诗词文学': 'poetry',
  '古建工程': 'architecture',
  '文化交流': 'influx',
  '科技发明': 'technology',
  '科举儒典': 'exam',
  '商业贸易': 'trade',
  '外交朝贡': 'diplomacy',
  '典籍编撰': 'classics'
};

// 渲染事件逻辑变更
function renderAnnualEvents(year, centuryData) {
  // ... (获取朝代及头部信息逻辑)
  annEventsList.innerHTML = '';
  const yearEntry = centuryData.find(e => e.year === year);

  if (yearEntry && yearEntry.events && yearEntry.events.length > 0) {
    yearEntry.events.forEach(event => {
      const eventRow = document.createElement('div');
      
      // 判断是否是重大事件，添加 major-event 类名
      eventRow.className = `annual-event-row ${event.isMajor ? 'major-event' : ''}`;
      
      // 动态映射英文分类获取样式类，直接展示中文 Label
      const englishCategory = CATEGORY_TO_CLASS[event.category] || 'livelihood';
      const tagClass = `tag-${englishCategory}`;
      const tagLabel = event.category;

      // 渲染重大事件徽章
      const majorBadgeHtml = event.isMajor ? `<span class="major-badge">★ 重大事件</span>` : '';

      eventRow.innerHTML = `
        <div class="event-row-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="event-row-title">${event.title}</h3>
            ${majorBadgeHtml}
          </div>
          <span class="event-row-tag ${tagClass}">${tagLabel}</span>
        </div>
        <p class="event-row-desc">${event.desc}</p>
      `;
      annEventsList.appendChild(eventRow);
    });
  } else {
    // ... 缺省兜底逻辑保持不变
  }
}
```

---

### 2.3 样式设计 (`src/css/style.css`)

我们将在 CSS 中新增“帝王金”视觉效果，以凸显重大历史时刻的庄重与厚重感：

```css
/* ==========================================
   重大历史事件 (isMajor) 高级帝王金样式
   ========================================== */

.annual-event-row.major-event {
  border-color: rgba(212, 175, 55, 0.45);
  background: linear-gradient(135deg, #fdfdfb 0%, #fbf8ef 100%);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.08);
}

.annual-event-row.major-event::before {
  /* 金色渐变左侧边条 */
  background: linear-gradient(to bottom, #d4af37, #aa7c11);
}

.major-badge {
  /* 帝王金渐变徽章 */
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 1px;
  box-shadow: 0 2px 5px rgba(212, 175, 55, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-sans);
}
```

---

## 3. 并行数据整理执行设计

鉴于要生成大量真实的大事记条目，采用传统的单线程生成极易因上下文超限而造成数据被高度概括或截断。

我们将使用 **子代理并行工作流 (Parallel Subagent Workflow)**，将 20 个世纪分为 4 个工作组（Workgroups），每组指派一个专门的子代理独立执行：

| 工作组名称 | 覆盖世纪范围 | 覆盖公元年份 | 历史时期重点 |
| :--- | :--- | :--- | :--- |
| **Workgroup A** | 1 ~ 5 世纪 | 1 AD ~ 500 AD | 两汉交替、光武中兴、明章之治、三国割据、西晋短暂统一、五胡十六国、南北朝南北并立对峙 |
| **Workgroup B** | 6 ~ 10 世纪 | 501 AD ~ 1000 AD | 南北朝末期、隋朝一统、贞观之治、开元盛世、安史之乱、藩镇割据、五代十国割据大混战、辽朝崛起与北宋立国 |
| **Workgroup C** | 11 ~ 15 世纪 | 1001 AD ~ 1500 AD | 北宋澶渊之盟、王安石变法、靖康之耻、南宋偏安、元朝大一统、大明开国、洪武之治、永乐盛世与郑和下西洋、土木堡之变 |
| **Workgroup D** | 16 ~ 20 世纪 | 1501 AD ~ 2000 AD | 明中晚期、资本主义萌芽、明清交替、康乾盛世、鸦片战争、洋务运动与辛亥革命、民国军阀混战、抗日战争、新中国建立、改革开放 |

### 数据生成质量控制红线：
1. **零占位符与深度描述：** 绝对禁止生成“如期运行”、“平稳恢复”等毫无营养的敷衍词句，必须是实实在在的史实（例如：王莽篡位、蔡伦造纸、赤壁之战、九品中正、淝水之战、开皇之治、玄武门之变、杯酒释兵权、崖山海战、靖难之役、甲申国难、中俄尼布楚条约等）。**每条历史事件描述必须详尽，字数建议在 150字左右**（建议 120-180字之间），透彻交代事件起因、经过、人物角色及长远历史影响。
2. **格式规范：** 所有输出文件必须符合原 JSON 数组的格式，确保 JSON 语法 100% 正确。
3. **重大事件控制：** 每世纪 100 年中，平均有 **10 - 20 个** 核心转折点标记为 `isMajor: true`，其余为常规大事记，保证高亮密度合理，避免“满屏皆重大”的视觉混乱。
4. **史料对照：** 内容符合正史纪年，如纪年所载年号需对应公历年份。

---

## 4. 验证与测试方案

1. **JSON 结构验证：** 编写一个 Node.js 验证脚本 `tests/validate-timeline.js`。该脚本自动遍历 1~20 世纪的 JSON 文件，验证：
   - 是否包含完备的 100 年数据，且年份连续递增。
   - 每年是否包含 1 ~ 5 个大事记事件。
   - 每个事件是否具备 `title`、`category`、`desc` 属性。
   - `category` 的属性值是否全部为中文字符，且在预设的 12 个中文分类内。
   - JSON 语法本身是否合规。
2. **前端页面调试验证：** 运行 `npm run dev` 并在浏览器中开启“纪年模式”，手动切换不同的世纪和年份，重点测试：
   - 中文分类的色彩标签是否工作正常（是否匹配 CSS 样式类）。
   - `"isMajor": true` 的重大事件卡片是否完美应用了帝王金视觉特效和金色徽章。
   - 确保无 JS 抛错，轮播及年份步进组件工作正常。
