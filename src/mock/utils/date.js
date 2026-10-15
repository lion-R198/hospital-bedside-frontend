/** 日期工具：生成相对今天的日期字符串，保证模拟数据始终“新鲜” */
const pad = (n) => String(n).padStart(2, '0')

export function dayOffset(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function today() {
  return dayOffset(0)
}

export function nowTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
