# 中华朝代长卷史料扩充实施计划 (Chinese History Timeline Enrichment Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 深度扩充 `src/data/history-timeline.json` 中的中华朝代史料，丰富描述且为大一统朝代补充高密度的学术里程碑节点，并通过新增自动化测试进行验证。

**Architecture:** 
1. 编写自动化测试文件 `tests/history-timeline.test.js`，验证 JSON 文件格式、朝代数量、关键字段、高密度里程碑数量（每个朝代至少 6 个以上）以及占位符查禁。
2. 彻底重写 `src/data/history-timeline.json`，补充真实、详实的学术史料与丰富的高密度里程碑。
3. 运行 Vitest 测试验证 100% 通过，并测试打包验证前端构建成功。

**Tech Stack:** ES6 JSON + Vitest 测试框架 + Vite 构建工具。

---

## 实施任务分解 (Task Breakdowns)

### Task 1: 编写自动化验证测试验证 timeline 数据约束 (TDD 验证)

**Files:**
- Create: `tests/history-timeline.test.js`

- [ ] **Step 1: 编写 failing test 验证脚本**
  
  在 `tests/history-timeline.test.js` 中编写全面的单元测试，验证 `history-timeline.json` 的学术规整度。该测试会在未扩展前报错（因为西边很多朝代如隋、秦的里程碑均少于 6 个）。
  
  ```javascript
  import { describe, it, expect } from 'vitest';
  import fs from 'fs';
  import path from 'path';

  describe('中华朝代长卷 JSON 史料格式与学术密度验证', () => {
    const filePath = path.resolve('src/data/history-timeline.json');

    it('文件必须存在，且能被正常解析为 JSON 数组', () => {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(14); // 先秦、秦、汉、三国、晋、南北朝、隋、唐、五代、宋、元、明、清、近现代
    });

    it('所有朝代的基本结构与学术密度验证', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      const EXPECTED_IDS = [
        'pre-qin', 'qin', 'han', 'three-kingdoms', 'jin-dynasty',
        'southern-northern', 'sui', 'tang', 'five-dynasties',
        'song-period', 'yuan', 'ming', 'qing', 'modern-era'
      ];

      data.forEach((era, index) => {
        expect(era.id).toBe(EXPECTED_IDS[index]);
        expect(typeof era.name).toBe('string');
        expect(typeof era.ename).toBe('string');
        expect(typeof era.color).toBe('string');
        expect(typeof era.description).toBe('string');
        expect(era.description.length).toBeGreaterThan(50); // 描述必须具有学术厚度，长度 > 50字
        
        if (era.type === 'dynasty') {
          expect(Array.isArray(era.milestones)).toBe(true);
          // 学术密度硬性约束：每个大一统/主王朝大事记里程碑必须不少于 6 个
          expect(era.milestones.length).toBeGreaterThanOrEqual(6);

          era.milestones.forEach((stone, sIdx) => {
            expect(typeof stone.year).toBe('string');
            expect(typeof stone.title).toBe('string');
            expect(typeof stone.desc).toBe('string');
            expect(stone.desc.length).toBeGreaterThan(15); // 事件描述必须具体，长度 > 15字
            expect(Array.isArray(stone.tags)).toBe(true);
            expect(stone.tags.length).toBeGreaterThan(0);
          });
        } else if (era.type === 'concurrency') {
          expect(Array.isArray(era.states)).toBe(true);
          expect(era.states.length).toBeGreaterThan(0);

          era.states.forEach(state => {
            expect(typeof state.name).toBe('string');
            expect(typeof state.capital).toBe('string');
            expect(typeof state.founder).toBe('string');
            expect(typeof state.desc).toBe('string');
            expect(state.desc.length).toBeGreaterThan(30); // 政权描述必须具体
          });
        } else {
          throw new Error(`未知的类型: ${era.type}`);
        }
      });
    });

    it('全局数据中不得含有任何临时占位符', () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const forbiddenWords = ['TODO', 'TBD', '待补充', '占位', '等。', '相似事件', '未完待续'];
      
      forbiddenWords.forEach(word => {
        expect(content.includes(word)).toBe(false);
      });
    });
  });
  ```

- [ ] **Step 2: 运行测试并确保其失败 (Fail Check)**
  
  运行以下测试命令，确认其失败（预期部分朝代如 Sui、Yuan 历史事件数少于 6 个而报错）：
  ```bash
  npx vitest run tests/history-timeline.test.js
  ```
  预期结果：测试运行并失败，报告 milestones 长度小于 6。

- [ ] **Step 3: 提交 Task 1 变更**
  
  ```bash
  git add tests/history-timeline.test.js
  git commit -m "test: add automated vitest test suite for history-timeline database validation"
  ```

---

### Task 2: 重写与学术深度扩充 `history-timeline.json` 数据库

**Files:**
- Modify: `src/data/history-timeline.json`

- [ ] **Step 1: 编写全量扩容后的历史数据 JSON**
  
  将学术重塑后具有极高文字厚度、无任何占位符的 14 个历史时期的完美 JSON 写入 `src/data/history-timeline.json`。数据完全覆盖先秦、秦、两汉、三国、晋、南北朝、隋、唐、五代、宋辽金西夏、元、明、清、近现代的学术性大事记。

- [ ] **Step 2: 运行 Vitest 测试，验证数据完全符合约束并通过 (Pass Check)**
  
  运行刚才编写的测试集：
  ```bash
  npx vitest run tests/history-timeline.test.js
  ```
  预期结果：PASS。测试完全通过，无任何字段缺失或占位符。

- [ ] **Step 3: 运行完整打包，确保前端静态打包无任何标签、CSS或构建报错**
  
  ```bash
  npm run build
  ```
  预期结果：打包成功，生成 `dist/` 目录。

- [ ] **Step 4: 提交 Task 2 变更**
  
  ```bash
  git add src/data/history-timeline.json
  git commit -m "feat: enrich history-timeline database with academic milestones and robust historical accounts"
  ```
