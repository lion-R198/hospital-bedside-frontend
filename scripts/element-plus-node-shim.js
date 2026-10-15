/**
 * Node 侧验证脚本专用 element-plus 桩
 * 仅在 SSR 验证构建（isSsrBuild）时通过 vite alias 替换，
 * 提供 ElMessage/ElMessageBox 的无操作实现，避免 Node 环境缺 DOM。
 * 浏览器端构建不受影响。
 */
const noop = () => {}
export const ElMessage = Object.assign(noop, {
  error: noop,
  success: noop,
  warning: noop,
  info: noop
})
export const ElMessageBox = {
  confirm: noop,
  alert: noop,
  prompt: noop
}
export default { ElMessage, ElMessageBox }
