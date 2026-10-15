/**
 * 统一格式化工具
 */
const pad = (n) => String(n).padStart(2, '0')

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 金额格式化（DECIMAL(10,2)，人民币） */
export function formatMoney(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '-'
  return `¥${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/** 身份证脱敏：保留前 4 后 4 */
export function maskIdCard(idCard) {
  if (!idCard || idCard.length < 9) return idCard || '-'
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4)
}

/** 手机号脱敏：保留前 3 后 4 */
export function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || '-'
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/** 根据出生日期计算年龄 */
export function calcAge(birthDate) {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '-'
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1
  return age >= 0 ? age : '-'
}
