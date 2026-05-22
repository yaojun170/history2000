import fs from 'fs';
import path from 'path';

const VALID_TYPES = [
  'regime',
  'battle',
  'livelihood',
  'calendar',
  'poetry',
  'architecture',
  'influx',
  'technology',
  'exam',
  'trade',
  'diplomacy',
  'classics'
];

function verifyFile(filename, startYear, endYear) {
  console.log(`\n==================== Verifying ${filename} ====================`);
  const filePath = path.resolve('/Users/yaojun/devcode/aispace/antigravity_chats/history2000/src/data/timeline', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    console.error(`FAILED: JSON parsing failed for ${filename}:`, err.message);
    return false;
  }

  if (!Array.isArray(data)) {
    console.error(`FAILED: Root must be an array in ${filename}`);
    return false;
  }

  const yearMap = new Map();
  let errors = 0;
  let totalEvents = 0;

  for (const entry of data) {
    const { year, dynasty, emperor, events } = entry;
    
    if (typeof year !== 'number' || year < startYear || year > endYear) {
      console.error(`ERROR: Invalid or out-of-range year ${year} (expected ${startYear}-${endYear})`);
      errors++;
    }

    if (yearMap.has(year)) {
      console.error(`ERROR: Duplicate year entry for Year ${year}`);
      errors++;
    } else {
      yearMap.set(year, entry);
    }

    if (!dynasty || typeof dynasty !== 'string') {
      console.error(`ERROR: Missing or invalid dynasty for Year ${year}`);
      errors++;
    }

    if (!emperor || typeof emperor !== 'string') {
      console.error(`ERROR: Missing or invalid emperor for Year ${year}`);
      errors++;
    }

    if (!Array.isArray(events) || events.length === 0) {
      console.error(`ERROR: No events list or empty events list for Year ${year}`);
      errors++;
      continue;
    }

    for (let idx = 0; idx < events.length; idx++) {
      const event = events[idx];
      totalEvents++;

      if (!event.title || typeof event.title !== 'string') {
        console.error(`ERROR: Missing or invalid event title at Year ${year}, index ${idx}`);
        errors++;
      }

      if (!VALID_TYPES.includes(event.type)) {
        console.error(`ERROR: Invalid type "${event.type}" at Year ${year}, title "${event.title}". Valid types: ${VALID_TYPES.join(', ')}`);
        errors++;
      }

      if (!event.desc || typeof event.desc !== 'string') {
        console.error(`ERROR: Missing or invalid event desc at Year ${year}, title "${event.title}"`);
        errors++;
      } else {
        const descLength = event.desc.trim().length;
        if (descLength < 100) {
          console.error(`ERROR: Short desc (${descLength} chars, < 100) for Year ${year}, title "${event.title}":\n  "${event.desc}"`);
          errors++;
        }
      }
    }
  }

  // Check for missing years
  const missingYears = [];
  for (let y = startYear; y <= endYear; y++) {
    if (!yearMap.has(y)) {
      missingYears.push(y);
    }
  }

  if (missingYears.length > 0) {
    console.error(`ERROR: Missing year entries for: ${missingYears.join(', ')}`);
    errors += missingYears.length;
  }

  console.log(`Results for ${filename}:`);
  console.log(`- Total entries (years found): ${data.length}`);
  console.log(`- Total events: ${totalEvents}`);
  console.log(`- Total errors found: ${errors}`);
  if (missingYears.length > 0) {
    console.log(`- Total missing years: ${missingYears.length}`);
  }
  
  return errors === 0;
}

const c1Ok = verifyFile('century-1.json', 1, 100);
const c2Ok = verifyFile('century-2.json', 101, 200);

if (c1Ok && c2Ok) {
  console.log('\nSUCCESS: Both files verified successfully!');
  process.exit(0);
} else {
  console.error('\nFAILURE: Verification failed.');
  process.exit(1);
}
