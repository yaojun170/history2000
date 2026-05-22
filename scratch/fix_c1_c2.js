import fs from 'fs';
import path from 'path';

const TYPE_TO_CATEGORY = {
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

const c1MajorYears = new Set([
  1, 5, 8, 9, 17, 18, 23, 25, 27, 30, 31, 36, 37, 40, 42, 57, 73, 88, 91, 96, 99, 100
]);

const c2MajorYears = new Set([
  102, 105, 107, 118, 124, 125, 132, 147, 159, 166, 168, 172, 184, 189, 190, 192, 196, 200
]);

function fixFile(filePath, majorYears) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  data.forEach(entry => {
    entry.events.forEach(event => {
      // 1. Map type to category
      if (event.type && !event.category) {
        event.category = TYPE_TO_CATEGORY[event.type] || event.type;
        delete event.type;
      }
      
      // 2. Set isMajor
      if (majorYears.has(entry.year)) {
        event.isMajor = true;
      } else {
        delete event.isMajor;
      }
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✅ Fixed ${filePath}`);
}

const c1Path = '/Users/yaojun/devcode/aispace/antigravity_chats/history2000/src/data/timeline/century-1.json';
const c2Path = '/Users/yaojun/devcode/aispace/antigravity_chats/history2000/src/data/timeline/century-2.json';

fixFile(c1Path, c1MajorYears);
fixFile(c2Path, c2MajorYears);
