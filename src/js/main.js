import { formatYear } from './utils.js';

// 全局变量保存历史数据与状态
let historyData = [];
const centuryCache = {}; // 世纪数据二级缓存池
let activeView = 'dynasty'; // 'dynasty' or 'annual'
let selectedYear = 25; // 默认新东汉交替建武元年 (公元 25 年)
let currentActiveId = '';

// DOM 元素引用
const navContainer = document.getElementById('axis-nav-container');
const streamContainer = document.getElementById('chronicle-stream-container');
const appSeal = document.getElementById('app-seal');

// 视图切换 DOM
const btnDynastyView = document.getElementById('btn-dynasty-view');
const btnAnnualView = document.getElementById('btn-annual-view');
const dynastyViewContainer = document.getElementById('dynasty-view-container');
const annualViewContainer = document.getElementById('annual-view-container');
const searchContainer = document.getElementById('global-search-container');

// 纪年选择 DOM
const yearInput = document.getElementById('year-input');
const yearSlider = document.getElementById('year-slider');
const btnYearPrev = document.getElementById('btn-year-prev');
const btnYearNext = document.getElementById('btn-year-next');
const centuryAnchorGrid = document.getElementById('century-anchor-grid');

// 纪年事件列表 DOM
const annHeaderTitle = document.getElementById('ann-header-title');
const annHeaderMeta = document.getElementById('ann-header-meta');
const annEventsList = document.getElementById('ann-events-list');

// 历史事件分类标签中文化映射
const CATEGORY_NAMES = {
  regime: '政权更迭',
  battle: '军事战役',
  livelihood: '社会民生',
  calendar: '历法天象',
  poetry: '诗词文学',
  architecture: '古建工程',
  influx: '文化交流',
  technology: '科技发明',
  exam: '科举儒典',
  trade: '商业贸易',
  diplomacy: '外交朝贡',
  classics: '典籍编撰'
};

// 中文分类到英文样式名的反向映射 (支持数据直接汉化)
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

/**
 * 初始化应用
 */
async function initApp() {
  try {
    // 1. 加载历史朝代数据
    const historyRes = await fetch('./src/data/history-timeline.json');

    if (!historyRes.ok) {
      throw new Error('Failed to load historical raw data.');
    }

    historyData = await historyRes.json();

    // 2. 绑定首屏视图渲染
    renderApp(historyData);
    setupScrollObserver();
    setupSearch();

    // 3. 初始化纪年史记交互组件
    initAnnualSystem();
    
    // 4. 绑定视图切换
    setupViewSwitching();

  } catch (error) {
    console.error('Error initializing timeline:', error);
    streamContainer.innerHTML = `<div style="text-align:center;padding:50px;color:#b2584b;font-family:serif;">加载史册失败，请确认数据源是否存在。</div>`;
  }
}

/**
 * 渲染页面内容与电梯导航 (朝代长卷模式)
 * @param {Array} data 朝代数据列表
 */
function renderApp(data) {
  // 保持线轴
  navContainer.innerHTML = '<div class="axis-nodes-line"></div>';
  streamContainer.innerHTML = '';

  if (data.length === 0) {
    streamContainer.innerHTML = `<div style="text-align:center;padding:50px;color:#8b8070;font-family:serif;">无匹配历史记录</div>`;
    return;
  }

  data.forEach((era, index) => {
    // 渲染左侧导航节点
    const nodeBtn = document.createElement('button');
    nodeBtn.className = `axis-node-btn ${index === 0 && !currentActiveId ? 'active' : ''}`;
    nodeBtn.id = `nav-node-${era.id}`;
    nodeBtn.textContent = `${era.name} (${formatYear(era.startYear)})`;
    
    nodeBtn.addEventListener('click', () => {
      const cardTarget = document.getElementById(`dyn-card-${era.id}`);
      if (cardTarget) {
        cardTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activateNode(era.id, era.color);
      }
    });
    navContainer.appendChild(nodeBtn);

    // 渲染右侧大事记卡片
    const card = document.createElement('article');
    card.className = 'dynasty-card';
    card.id = `dyn-card-${era.id}`;
    card.style.setProperty('--accent-color', era.color);

    let cardHeaderHtml = `
      <div class="dyn-header">
        <div class="dyn-titles">
          <h2 class="dyn-name">${era.name}</h2>
          <div class="dyn-meta">
            ${formatYear(era.startYear)} ～ ${formatYear(era.endYear)}
            ${era.capital ? `· 都城：${era.capital}` : ''}
            ${era.founder ? `· 开国：${era.founder}` : ''}
          </div>
        </div>
        <span class="dyn-badge">${era.type === 'dynasty' ? '大一统' : '并立期'}</span>
      </div>
      <p class="dyn-desc">${era.description}</p>
    `;

    let cardBodyHtml = '';
    if (era.type === 'dynasty' && era.milestones) {
      cardBodyHtml += '<div class="milestone-axis">';
      era.milestones.forEach(stone => {
        cardBodyHtml += `
          <div class="milestone-node">
            <div class="milestone-year">${stone.year}</div>
            <h3 class="milestone-title">${stone.title}</h3>
            <p class="milestone-desc">${stone.desc}</p>
          </div>
        `;
      });
      cardBodyHtml += '</div>';
    } 
    else if (era.type === 'concurrency' && era.states) {
      cardBodyHtml += '<div class="concurrency-grid">';
      era.states.forEach(state => {
        cardBodyHtml += `
          <div class="concurrency-col" style="--state-color: ${state.color}">
            <h3 class="state-title">${state.name}</h3>
            <div class="state-meta">都城：${state.capital} · 创立：${state.founder}</div>
            <p class="state-desc">${state.desc}</p>
          </div>
        `;
      });
      cardBodyHtml += '</div>';
    }

    card.innerHTML = cardHeaderHtml + cardBodyHtml;
    streamContainer.appendChild(card);

    setTimeout(() => {
      card.classList.add('visible');
    }, 50 * index);
  });
}

/**
 * 手动激活某个导航电梯节点并更新全局 CSS 主题变量
 */
function activateNode(id, themeColor) {
  if (currentActiveId === id) return;
  currentActiveId = id;

  document.querySelectorAll('.axis-node-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetBtn = document.getElementById(`nav-node-${id}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateGlobalTheme(themeColor);
}

/**
 * 平滑过渡更新全局主题色
 */
function updateGlobalTheme(themeColor) {
  document.documentElement.style.setProperty('--accent-theme', themeColor);
  document.documentElement.style.setProperty('--accent-glow', `${themeColor}10`);
  if (appSeal) {
    appSeal.style.backgroundColor = themeColor;
  }
}

/**
 * 初始化 IntersectionObserver
 */
function setupScrollObserver() {
  const options = {
    root: null,
    rootMargin: '-20% 0px -40% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cardId = entry.target.id.replace('dyn-card-', '');
        const era = historyData.find(e => e.id === cardId);
        if (era) {
          activateNode(era.id, era.color);
        }
      }
    });
  }, options);

  document.querySelectorAll('.dynasty-card').forEach(card => {
    observer.observe(card);
  });
}

/**
 * 初始化模糊搜索
 */
function setupSearch() {
  const searchBar = document.getElementById('search-bar');
  if (!searchBar) return;

  searchBar.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (!query) {
      renderApp(historyData);
      setupScrollObserver();
      return;
    }

    const filtered = historyData.filter(era => {
      const matchName = era.name.toLowerCase().includes(query);
      const matchDesc = era.description.toLowerCase().includes(query);
      const matchFounder = era.founder && era.founder.toLowerCase().includes(query);
      
      let matchMilestone = false;
      if (era.milestones) {
        matchMilestone = era.milestones.some(stone => 
          stone.title.toLowerCase().includes(query) || 
          stone.desc.toLowerCase().includes(query)
        );
      }

      let matchStates = false;
      if (era.states) {
        matchStates = era.states.some(state => 
          state.name.toLowerCase().includes(query) || 
          state.desc.toLowerCase().includes(query)
        );
      }

      return matchName || matchDesc || matchFounder || matchMilestone || matchStates;
    });

    renderApp(filtered);
  });
}

/**
 * 绑定视图切换逻辑
 */
function setupViewSwitching() {
  btnDynastyView.addEventListener('click', () => {
    if (activeView === 'dynasty') return;
    activeView = 'dynasty';
    
    btnDynastyView.classList.add('active');
    btnAnnualView.classList.remove('active');
    
    dynastyViewContainer.classList.remove('hidden');
    annualViewContainer.classList.add('hidden');
    searchContainer.classList.remove('hidden');
  });

  btnAnnualView.addEventListener('click', () => {
    if (activeView === 'annual') return;
    activeView = 'annual';
    
    btnAnnualView.classList.add('active');
    btnDynastyView.classList.remove('active');
    
    annualViewContainer.classList.remove('hidden');
    dynastyViewContainer.classList.add('hidden');
    searchContainer.classList.add('hidden'); // 纪年模式使用左侧索盘

    // 载入纪年页面初始状态
    syncAnnualYear(selectedYear);
  });
}

/* ========================================================
   纪年史记 (Annual Annals) 控制系统与动态解析引擎
   ======================================================== */

/**
 * 初始化纪年控制面板与事件
 */
function initAnnualSystem() {
  // 1. 动态渲染左侧世纪快捷按钮
  centuryAnchorGrid.innerHTML = '';
  for (let century = 1; century <= 20; century++) {
    const btn = document.createElement('button');
    btn.className = `century-btn ${century === 1 ? 'active' : ''}`;
    btn.id = `century-btn-${century}`;
    btn.textContent = `${century}世纪`;
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.century-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 定位到该世纪第一年
      const targetYear = (century - 1) * 100 + 1;
      syncAnnualYear(targetYear);
    });
    
    centuryAnchorGrid.appendChild(btn);
  }

  // 2. 年份步进按钮绑定
  btnYearPrev.addEventListener('click', () => {
    if (selectedYear > 1) {
      syncAnnualYear(selectedYear - 1);
    }
  });

  btnYearNext.addEventListener('click', () => {
    if (selectedYear < 2000) {
      syncAnnualYear(selectedYear + 1);
    }
  });

  // 3. 滑动条与手动输入绑定
  yearSlider.addEventListener('input', (e) => {
    syncAnnualYear(parseInt(e.target.value));
  });

  yearInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 25;
    if (val < 1) val = 1;
    if (val > 2000) val = 2000;
    syncAnnualYear(val);
  });
}

/**
 * 同步并渲染选定的年份历史数据
 * @param {number} year 公元年份
 */
async function syncAnnualYear(year) {
  selectedYear = year;

  // 1. 同步输入控件值
  yearInput.value = year;
  yearSlider.value = year;

  // 2. 同步高亮当前世纪按钮
  const century = Math.ceil(year / 100);
  document.querySelectorAll('.century-btn').forEach(b => b.classList.remove('active'));
  const actBtn = document.getElementById(`century-btn-${century}`);
  if (actBtn) actBtn.classList.add('active');

  // 3. 异步获取对应世纪数据并做缓存
  annHeaderTitle.textContent = `公元 ${year} 年`;
  annHeaderMeta.textContent = `加载中...`;
  annEventsList.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:serif;">正在翻阅史册，请稍候...</div>`;

  try {
    let centuryData;
    if (centuryCache[century]) {
      centuryData = centuryCache[century];
    } else {
      const res = await fetch(`./src/data/timeline/century-${century}.json`);
      if (!res.ok) throw new Error(`无法载入第 ${century} 世纪史料`);
      centuryData = await res.json();
      centuryCache[century] = centuryData;
    }

    renderAnnualEvents(year, centuryData);
  } catch (error) {
    console.error(error);
    annHeaderMeta.textContent = `载入失败`;
    annEventsList.innerHTML = `<div style="text-align:center;padding:40px;color:#b2584b;font-family:serif;">未能调阅本世纪史料。</div>`;
  }
}

/**
 * 核心引擎：按年渲染中华大事记
 * @param {number} year 公元年份
 * @param {Array} centuryData 世纪数据数组
 */
function renderAnnualEvents(year, centuryData) {
  annHeaderTitle.textContent = `公元 ${year} 年 (第 ${Math.ceil(year / 100)} 世纪)`;

  // 动态解算所属朝代（作为背景色联动）
  const dynamicDynasty = getDynastyByYear(year);
  updateGlobalTheme(dynamicDynasty.color);

  // 设置头部元数据
  annHeaderMeta.textContent = `中国政权：${dynamicDynasty.name} ${dynamicDynasty.capital ? `(都城：${dynamicDynasty.capital})` : ''}`;

  annEventsList.innerHTML = '';

  const yearEntry = centuryData.find(e => e.year === year);

  if (yearEntry && yearEntry.events && yearEntry.events.length > 0) {
    yearEntry.events.forEach(event => {
      const eventRow = document.createElement('div');
      eventRow.className = 'annual-event-row' + (event.isMajor ? ' major-event' : '');
      
      const englishCategory = CATEGORY_TO_CLASS[event.category] || event.category;
      const tagClass = `tag-${englishCategory}`;
      const tagLabel = CATEGORY_TO_CLASS[event.category] ? event.category : (CATEGORY_NAMES[event.category] || event.category);
      const majorBadgeHtml = event.isMajor ? `<span class="major-badge">★ 重大事件</span>` : '';

      eventRow.innerHTML = `
        <div class="event-row-header">
          <h3 class="event-row-title">${majorBadgeHtml}${event.title}</h3>
          <span class="event-row-tag ${tagClass}">${tagLabel}</span>
        </div>
        <p class="event-row-desc">${event.desc}</p>
      `;
      annEventsList.appendChild(eventRow);
    });
  } else {
    // 优雅的缺省兜底
    const eventRow = document.createElement('div');
    eventRow.className = 'annual-event-row';
    eventRow.innerHTML = `
      <div class="event-row-header">
        <h3 class="event-row-title">平稳繁衍期</h3>
        <span class="event-row-tag tag-livelihood">社会民生</span>
      </div>
      <p class="event-row-desc">此年属于${dynamicDynasty.name}历史长河中的平缓年份。无重大政权更迭或大规模战役，各地百姓男耕女织，手工业与民间贸易正常流淌。</p>
    `;
    annEventsList.appendChild(eventRow);
  }
}

/**
 * 辅助算法：依据公元年份精确推导当时对应朝代
 */
function getDynastyByYear(year) {
  const era = historyData.find(e => year >= e.startYear && year <= e.endYear);
  if (era) return era;
  
  return {
    name: "中原交替",
    color: "#7a5840",
    description: "处于中原文明的政权演变与更替交接期",
    founder: "天子诸侯",
    capital: "中原都城"
  };
}

// 挂载主入口
window.addEventListener('DOMContentLoaded', initApp);
