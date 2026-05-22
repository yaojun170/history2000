import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.resolve('src/data/timeline/temp');

const majorEventsToKeep = [
  { year: 502, title: '萧衍受禅称帝建立梁朝' },
  { year: 507, title: '钟离之战梁军大捷' },
  { year: 523, title: '北魏爆发六镇之乱' },
  { year: 528, title: '河阴之变与北魏宗室大屠杀' },
  { year: 529, title: '陈庆之率白袍军北伐直取洛阳' },
  { year: 534, title: '北魏分裂与东魏建立' },
  { year: 537, title: '沙苑之战西魏以寡敌众大败东魏' },
  { year: 549, title: '台城陷落与梁武帝饿死台城' },
  { year: 550, title: '高洋废魏建齐建立北齐政权' },
  { year: 554, title: '西魏攻陷江陵与梁朝藏书浩劫' },
  { year: 557, title: '陈霸先废梁建陈建立陈朝' },
  { year: 572, title: '北齐后主冤杀国之柱石斛律光' },
  { year: 577, title: '北周灭亡北齐统一北方' },
  { year: 580, title: '周宣帝暴崩与杨坚平定三方叛乱' },
  { year: 581, title: '杨坚受禅称帝建立隋朝' },
  { year: 589, title: '隋军攻陷建康陈朝灭亡全国统一' },
  { year: 590, title: '杨素平定江南世族叛乱与隋推三省制' },
  { year: 599, title: '突厥启民可汗降隋与北疆臣服' },
  { year: 600, title: '杨广夺嫡与隋文帝废太子杨勇' }
];

const keepSet = new Set(majorEventsToKeep.map(e => `${e.year}:${e.title}`));

for (let i = 1; i <= 10; i++) {
  const filePath = path.join(TEMP_DIR, `c6-${i}.json`);
  if (!fs.existsSync(filePath)) continue;
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.forEach(entry => {
    entry.events.forEach(event => {
      const key = `${entry.year}:${event.title}`;
      if (keepSet.has(key)) {
        event.isMajor = true;
      } else {
        delete event.isMajor;
      }
    });
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

console.log('✅ Century 6 major events successfully adjusted!');
