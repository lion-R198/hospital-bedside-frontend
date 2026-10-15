/**
 * 接口契约审计脚本（二次校验）
 *
 * 目的：交叉比对「前端 API 模块声明的请求地址」与「Mock 路由已实现的地址」，
 *      确保前端功能所需请求地址完整、无悬空调用、无冗余实现。
 *
 * 运行：node scripts/api-contract-audit.js
 * 输出：控制台报告 + docs/api-audit-report.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

/** 归一化路径：/education/${id} → /education/:param，/meal-orders/:id/cancel → .../:param/cancel */
function normalize(url) {
  return url
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/:[A-Za-z_][\w]*/g, ':param')
    .replace(/\/+$/, '')
}

// ---------- 1. 解析 API 模块 ----------
const apiDir = path.join(ROOT, 'src/api')
const apiEndpoints = []
for (const file of fs.readdirSync(apiDir).filter((f) => f.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(apiDir, file), 'utf8')
  // 逐个 request 调用块解析：函数名 / JSDoc / method / url
  const blocks = [...src.matchAll(/\/\*\*([\s\S]*?)\*\/\s*export function (\w+)\([^)]*\)\s*\{([\s\S]*?)\n\}/g)]
  for (const [, doc, fnName, body] of blocks) {
    const urlMatch = body.match(/url:\s*(['"`])([^'"`]+)\1/)
    const methodMatch = body.match(/method:\s*'(get|post|put|delete|patch)'/i)
    if (!urlMatch) continue
    const comment = doc.replace(/\s*\*\s?/g, ' ').trim()
    apiEndpoints.push({
      apiFile: file,
      fn: fnName,
      method: (methodMatch?.[1] || 'get').toUpperCase(),
      url: urlMatch[2],
      doc: comment
    })
  }
}

// ---------- 2. 解析 Mock 路由 ----------
const mockSrc = read('src/mock/index.js')
const mockRoutes = [...mockSrc.matchAll(/route\('([A-Z]+)',\s*'([^']+)'/g)].map(([, method, url]) => ({
  method,
  url
}))

// ---------- 3. 交叉比对 ----------
const mockKeys = new Set(mockRoutes.map((r) => `${r.method} ${normalize(r.url)}`))
const apiKeys = new Set(apiEndpoints.map((e) => `${e.method} ${normalize(e.url)}`))

const missingInMock = apiEndpoints.filter((e) => !mockKeys.has(`${e.method} ${normalize(e.url)}`))
const unusedInMock = mockRoutes.filter((r) => !apiKeys.has(`${r.method} ${normalize(r.url)}`))

// ---------- 4. 页面 → 接口 映射 ----------
const viewDir = path.join(ROOT, 'src/views')
const pageUsage = []
for (const page of fs.readdirSync(viewDir)) {
  const file = path.join(viewDir, page, 'index.vue')
  if (!fs.existsSync(file)) continue
  const src = fs.readFileSync(file, 'utf8')
  const fns = new Set()
  // import { a, b } from '@/api/x'
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*'@\/api\/(\w+)'/g)) {
    m[1].split(',').forEach((n) => n.trim() && fns.add(n.trim()))
  }
  const matched = apiEndpoints.filter((e) => fns.has(e.fn))
  pageUsage.push({ page, apiFiles: [...new Set(matched.map((m) => m.apiFile))], endpoints: matched })
}
// store 中的调用（全局：公告、登录/令牌）
const storeSrc = ['src/store/modules/app.js', 'src/store/modules/user.js']
  .map((f) => read(f))
  .join('\n')
const storeFns = new Set()
for (const m of storeSrc.matchAll(/import\s*\{([^}]+)\}\s*from\s*'@\/api\/\w+'/g)) {
  m[1].split(',').forEach((n) => {
    const name = n.trim().split(/\s+as\s+/)[0].trim()
    if (name) storeFns.add(name)
  })
}

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    apiCount: apiEndpoints.length,
    mockCount: mockRoutes.length,
    missingInMock: missingInMock.length,
    unusedInMock: unusedInMock.length
  },
  apiEndpoints,
  mockRoutes,
  missingInMock,
  unusedInMock,
  pageUsage,
  storeEndpoints: apiEndpoints.filter((e) => storeFns.has(e.fn))
}

const outDir = path.join(ROOT, 'docs')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'api-audit-report.json'), JSON.stringify(report, null, 2), 'utf8')

// ---------- 控制台报告 ----------
console.log('================ 接口契约审计（二次校验） ================')
console.log(`前端 API 声明接口数：${apiEndpoints.length}`)
console.log(`Mock 已实现路由数：${mockRoutes.length}`)
console.log(`\n[页面 → 接口] 映射：`)
for (const p of pageUsage) {
  console.log(`  ${p.page.padEnd(12)} ${p.endpoints.map((e) => `${e.method} ${e.url}`).join(' | ') || '（无接口调用）'}`)
}
console.log(`\n[全局 store] 调用：`)
for (const e of report.storeEndpoints) console.log(`  ${e.method} ${e.url}   (${e.apiFile} · ${e.fn})`)

console.log(`\n[校验1] 前端调用但 Mock 未实现（悬空调用）：${missingInMock.length} 个`)
missingInMock.forEach((e) => console.log(`  ✗ ${e.method} ${e.url}  (${e.apiFile} · ${e.fn})`))
if (!missingInMock.length) console.log('  ✓ 无悬空调用，请求地址完整')

console.log(`\n[校验2] Mock 已实现但前端未调用（冗余实现）：${unusedInMock.length} 个`)
unusedInMock.forEach((r) => console.log(`  ! ${r.method} ${r.url}`))
if (!unusedInMock.length) console.log('  ✓ 无冗余实现')

console.log(`\n报告已写入 docs/api-audit-report.json`)
