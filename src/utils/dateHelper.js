/** 日期补零小工具（供多处复用） */
export function pad(n) {
  return String(n).padStart(2, '0')
}
