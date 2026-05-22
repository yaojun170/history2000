/**
 * 格式化年份，负数返回“前X年”，正数返回“公元X年”
 * @param {number} year 年份数字
 * @returns {string} 格式化后的字符串
 */
export function formatYear(year) {
  if (typeof year !== 'number') {
    throw new Error('Year must be a number');
  }
  if (year < 0) {
    return `前${Math.abs(year)}年`;
  }
  return `公元${year}年`;
}
