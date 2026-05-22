import { formatYear } from './utils.js';

// 全局变量保存历史数据与活动朝代
let historyData = [];
let currentActiveId = '';

const navContainer = document.getElementById('axis-nav-container');
const streamContainer = document.getElementById('chronicle-stream-container');
const appSeal = document.getElementById('app-seal');

/**
 * 初始化数据并触发渲染
 */
async function initApp() {
  try {
    const response = await fetch('./src/data/history-timeline.json');
    if (!response.ok) {
      throw new Error('Failed to load history data');
    }
    historyData = await response.json();
    
    renderApp(historyData);
    setupScrollObserver();
    setupSearch();
  } catch (error) {
    console.error('Error initializing timeline:', error);
    streamContainer.innerHTML = `<div style="text-align:center;padding:50px;color:#b2584b;font-family:serif;">加载史册失败，请确认数据源是否存在。</div>`;
  }
}

/**
 * 渲染页面内容与电梯导航
 * @param {Array} data 朝代数据列表
 */
function renderApp(data) {
  // 1. 清空旧结构
  // 保持线轴
  navContainer.innerHTML = '<div class="axis-nodes-line"></div>';
  streamContainer.innerHTML = '';

  if (data.length === 0) {
    streamContainer.innerHTML = `<div style="text-align:center;padding:50px;color:#8b8070;font-family:serif;">无匹配历史记录</div>`;
    return;
  }

  data.forEach((era, index) => {
    // 2. 渲染左侧索盘导航电梯节点
    const nodeBtn = document.createElement('button');
    nodeBtn.className = `axis-node-btn ${index === 0 && !currentActiveId ? 'active' : ''}`;
    nodeBtn.id = `nav-node-${era.id}`;
    nodeBtn.textContent = `${era.name} (${formatYear(era.startYear)})`;
    
    // 点击平滑滚动锚定
    nodeBtn.addEventListener('click', () => {
      const cardTarget = document.getElementById(`dyn-card-${era.id}`);
      if (cardTarget) {
        cardTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activateNode(era.id, era.color);
      }
    });
    navContainer.appendChild(nodeBtn);

    // 3. 渲染右侧大事记大卡片
    const card = document.createElement('article');
    card.className = 'dynasty-card';
    card.id = `dyn-card-${era.id}`;
    card.style.setProperty('--accent-color', era.color);

    // 朝代卡片标题信息
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

    // 事件内部时间轴
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
    // 割据分裂政权并立展示
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

    // 微弱延迟，确保淡入动画生效
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

  // 更新导航高亮
  document.querySelectorAll('.axis-node-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const targetBtn = document.getElementById(`nav-node-${id}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
    // PC 端滚动电梯自适应
    targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 平滑过渡更改全局 CSS 变量
  document.documentElement.style.setProperty('--accent-theme', themeColor);
  document.documentElement.style.setProperty('--accent-glow', `${themeColor}10`);
  if (appSeal) {
    appSeal.style.backgroundColor = themeColor;
  }
}

/**
 * 初始化 IntersectionObserver 用于滚动监听并动态激活
 */
function setupScrollObserver() {
  const options = {
    root: null,
    rootMargin: '-20% 0px -40% 0px', // 在视口中间偏上位置触发
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
 * 初始化全文模糊搜索
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

    // 检索朝代名、描述、开国皇帝、并立政权、或大事记
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

// 挂载执行
window.addEventListener('DOMContentLoaded', initApp);
