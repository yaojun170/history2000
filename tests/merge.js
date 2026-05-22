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

const TEMP_DIR = path.resolve('src/data/timeline/temp');
const OUT_DIR = path.resolve('src/data/timeline');

function mergeCentury(century) {
  const startYear = (century - 1) * 100 + 1;
  const endYear = century * 100;
  
  console.log(`=== Merging Century ${century} (${startYear} - ${endYear}) ===`);
  
  if (!fs.existsSync(TEMP_DIR)) {
    console.error(`❌ Temp directory not found: ${TEMP_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(TEMP_DIR)
    .filter(f => f.startsWith(`c${century}-`) && f.endsWith('.json'))
    .sort();
    
  if (files.length === 0) {
    console.error(`❌ No temp files found for Century ${century} in ${TEMP_DIR}`);
    process.exit(1);
  }
  
  console.log(`Found ${files.length} chunk files to merge.`);
  
  let allYearsMap = new Map();
  
  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    let chunk;
    try {
      chunk = JSON.parse(content);
    } catch (e) {
      console.error(`❌ JSON parse error in file ${file}: ${e.message}`);
      process.exit(1);
    }
    
    if (!Array.isArray(chunk)) {
      console.error(`❌ File ${file} does not contain an array`);
      process.exit(1);
    }
    
    for (const entry of chunk) {
      const year = entry.year;
      if (year < startYear || year > endYear) {
        console.error(`❌ Year ${year} in file ${file} is out of bounds for Century ${century}`);
        process.exit(1);
      }
      if (allYearsMap.has(year)) {
        console.error(`❌ Duplicate year ${year} found! Already saw it in previous chunks.`);
        process.exit(1);
      }
      allYearsMap.set(year, entry);
    }
  }
  
  // Verify completeness
  const compiledData = [];
  let hasErrors = false;
  let totalEvents = 0;
  let majorCount = 0;
  
  for (let year = startYear; year <= endYear; year++) {
    if (!allYearsMap.has(year)) {
      console.error(`❌ Missing year: ${year}`);
      hasErrors = true;
      continue;
    }
    
    const entry = allYearsMap.get(year);
    compiledData.push(entry);
    
    // Check events
    const events = entry.events;
    if (!Array.isArray(events) || events.length < 1 || events.length > 5) {
      console.error(`❌ Year ${year}: Must have between 1 and 5 events (has ${events ? events.length : 0})`);
      hasErrors = true;
      continue;
    }
    
    events.forEach((event, eIdx) => {
      totalEvents++;
      if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
        console.error(`❌ Year ${year} [Event ${eIdx + 1}]: Title is empty`);
        hasErrors = true;
      }
      if (!ALLOWED_CATEGORIES.has(event.category)) {
        console.error(`❌ Year ${year} [Event ${eIdx + 1}]: Invalid category "${event.category}"`);
        hasErrors = true;
      }
      if (!event.desc || typeof event.desc !== 'string') {
        console.error(`❌ Year ${year} [Event ${eIdx + 1}]: Description is missing or not a string`);
        hasErrors = true;
      } else {
        const descLen = event.desc.trim().length;
        if (descLen < 80) {
          console.error(`❌ Year ${year} [Event ${eIdx + 1}]: Description is too short (${descLen} chars), must be >= 80`);
          hasErrors = true;
        } else if (descLen > 220) {
          console.warn(`⚠️ Year ${year} [Event ${eIdx + 1}]: Description is quite long (${descLen} chars). Target is ~150.`);
        }
        
        const placeholders = ['时期历史纪要', '如期运行', '平稳恢复', '贸易与市集', '地方水利与劝农', '平稳繁衍期'];
        placeholders.forEach(p => {
          if (event.title.includes(p) || event.desc.includes(p)) {
            console.error(`❌ Year ${year} [Event ${eIdx + 1}]: Contains placeholder "${p}"`);
            hasErrors = true;
          }
        });
      }
      
      if (event.isMajor) {
        if (event.isMajor !== true) {
          console.error(`❌ Year ${year} [Event ${eIdx + 1}]: isMajor must be boolean true or omitted`);
          hasErrors = true;
        }
        majorCount++;
      }
    });
  }
  
  if (hasErrors) {
    console.error(`❌ Merge failed due to validation errors. See above.`);
    process.exit(1);
  }
  
  if (majorCount < 10 || majorCount > 25) {
    console.warn(`⚠️ Warning: Major events count is ${majorCount}, expected between 10 and 25.`);
  }
  
  // Sort and write
  compiledData.sort((a, b) => a.year - b.year);
  
  const destPath = path.join(OUT_DIR, `century-${century}.json`);
  fs.writeFileSync(destPath, JSON.stringify(compiledData, null, 2) + '\n');
  console.log(`✅ Success! Century ${century} merged. ${totalEvents} events, ${majorCount} major events. Written to ${destPath}`);
}

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node tests/merge.js <century>');
  process.exit(1);
}

mergeCentury(parseInt(args[0], 10));
