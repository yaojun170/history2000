import fs from 'fs';
import path from 'path';

const ALLOWED_CATEGORIES = new Set([
  '政权更迭',
  '军事战役',
  '社会民生',
  '历法天象',
  '诗词文学',
  '古建工程',
  '文化交流',
  '科技发明',
  '科举儒典',
  '商业贸易',
  '外交朝贡',
  '典籍编撰'
]);

const TIMELINE_DIR = path.resolve('src/data/timeline');

function validateSingleCentury(century) {
  let hasErrors = false;
  let centuryMajorCount = 0;
  let centuryEventCount = 0;

  console.log(`=== Validating Century ${century} ===`);
  const filePath = path.join(TIMELINE_DIR, `century-${century}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    return false;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data)) {
      console.error(`❌ Error in [Century ${century}]: Root is not an array`);
      return false;
    }

    if (data.length !== 100) {
      console.error(`❌ Error in [Century ${century}]: Array length is ${data.length}, expected exactly 100`);
      hasErrors = true;
    }

    let startYear = (century - 1) * 100 + 1;
    let endYear = century * 100;
    let prevYear = startYear - 1;

    data.forEach((entry, idx) => {
      const year = entry.year;

      // 1. 验证年份连续与递增
      if (year !== prevYear + 1) {
        console.error(`❌ Error in [Century ${century}] Year ${year}: Out of sequence, expected ${prevYear + 1}`);
        hasErrors = true;
      }
      if (year < startYear || year > endYear) {
        console.error(`❌ Error in [Century ${century}] Year ${year}: Year is out of century bounds [${startYear}-${endYear}]`);
        hasErrors = true;
      }
      prevYear = year;

      // 2. 验证事件配比 (1 ~ 5)
      const events = entry.events;
      if (!Array.isArray(events)) {
        console.error(`❌ Error in [Century ${century}] Year ${year}: 'events' is missing or not an array`);
        hasErrors = true;
        return;
      }

      if (events.length < 1 || events.length > 5) {
        console.error(`❌ Error in [Century ${century}] Year ${year}: Has ${events.length} events, expected between 1 and 5`);
        hasErrors = true;
      }

      // 3. 验证事件具体内容
      events.forEach((event, eIdx) => {
        centuryEventCount++;

        if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
          console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Title is missing or empty`);
          hasErrors = true;
        }

        // 4. 验证中文分类
        if (!ALLOWED_CATEGORIES.has(event.category)) {
          console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Invalid category "${event.category}". Expected one of: ${Array.from(ALLOWED_CATEGORIES).join(', ')}`);
          hasErrors = true;
        }

        // 5. 验证详细描述字数 (最少80字，推荐120-180字)
        if (!event.desc || typeof event.desc !== 'string') {
          console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Description is missing or not a string`);
          hasErrors = true;
        } else {
          const descLen = event.desc.trim().length;
          if (descLen < 80) {
            console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Description is too short (${descLen} chars), must be at least 80 characters.`);
            hasErrors = true;
          } else if (descLen < 110) {
            console.warn(`⚠️ Warning in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Description could be more detailed (${descLen} chars). Target is ~150 chars.`);
          }

          // 6. 验证无占位符文本
          const placeholders = ['时期历史纪要', '如期运行', '平稳恢复', '贸易与市集', '地方水利与劝农', '平稳繁衍期'];
          placeholders.forEach(p => {
            if (event.title.includes(p) || event.desc.includes(p)) {
              console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: Contains forbidden placeholder text: "${p}"`);
              hasErrors = true;
            }
          });
        }

        // 7. 统计重大事件
        if (event.isMajor) {
          if (event.isMajor !== true) {
            console.error(`❌ Error in [Century ${century}] Year ${year} [Event ${eIdx + 1}]: 'isMajor' must be a boolean true or omitted`);
            hasErrors = true;
          }
          centuryMajorCount++;
        }
      });
    });

    console.log(`ℹ️ [Century ${century}]: Validated ${centuryEventCount} events. Major events count: ${centuryMajorCount}`);

    // 8. 验证重大事件比例合理性
    if (centuryMajorCount < 10 || centuryMajorCount > 25) {
      console.warn(`⚠️ Warning in [Century ${century}]: Major events count is ${centuryMajorCount}. Ideal density is 10 ~ 25 per century.`);
      if (centuryMajorCount < 5 || centuryMajorCount > 35) {
        hasErrors = true;
        console.error(`❌ Error in [Century ${century}]: Major events count ${centuryMajorCount} is out of absolute limits [5-35].`);
      }
    }

  } catch (e) {
    console.error(`❌ Error reading/parsing [Century ${century}]: ${e.message}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.error(`❌ Century ${century} validation FAILED.\n`);
    return false;
  } else {
    console.log(`✅ Century ${century} validation PASSED!\n`);
    return true;
  }
}

const centuryArg = process.argv[2];
if (!centuryArg) {
  console.log("Usage: node tests/validate-single.js <century_number>");
  process.exit(1);
}

const pass = validateSingleCentury(parseInt(centuryArg, 10));
process.exit(pass ? 0 : 1);
