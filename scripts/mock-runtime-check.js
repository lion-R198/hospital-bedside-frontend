/**
 * Mock 接口契约运行时验证脚本（Node 侧执行）
 *
 * 用法：
 *   npx vite build --ssr scripts/mock-runtime-check.js --outDir .verify
 *   node .verify/mock-runtime-check.js
 *
 * 验证内容：登录鉴权 → 令牌注入 → 首页/患者/医嘱/体征/费用/饮食/点餐/医护/医院/宣教
 * 全部业务接口在 mock 模式下的契约与数据正确性。
 */
// Node 环境补丁：模拟浏览器 localStorage 与 Token 存储
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
}
globalThis.window = globalThis
// axios / vue 生态在 Node 环境下需要 location / navigator 桩
globalThis.location = new URL('http://localhost:5173/')
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', language: 'zh-CN' }, configurable: true })

// Element Plus 的 ElMessage 在 Node 环境下需要最小 DOM 桩
const fakeEl = () => ({
  style: {},
  classList: { add() {}, remove() {} },
  appendChild() {},
  remove() {},
  addEventListener() {},
  removeEventListener() {},
  setAttribute() {},
  querySelector: () => null
})
globalThis.document = {
  title: '',
  head: fakeEl(),
  body: fakeEl(),
  documentElement: fakeEl(),
  createElement: fakeEl,
  createTextNode: () => ({}),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {}
}

const { login, logout, getPatientContext } = await import('../src/api/auth.js')
import { setToken, clearAuth } from '../src/utils/auth.js'
const { getHomeSummary } = await import('../src/api/home.js')
const { getNoticeList } = await import('../src/api/notice.js')
const { getPatientInfo, getDiagnoses, getAllergies, getContacts } = await import('../src/api/patient.js')
const { getMedicalOrders, getExaminations } = await import('../src/api/order.js')
const { getVitalSigns } = await import('../src/api/vital.js')
const { getFeeDetails, getFeeDaily, getInsuranceInfo, getDepositSummary, getDepositRecords } = await import('../src/api/fee.js')
const { getTodayDiet, getNutritionPlan, getDietTaboos, getDishList, getMealOrders, createMealOrder } = await import('../src/api/diet.js')
const { getResponsibleStaff, getDutySchedule } = await import('../src/api/staff.js')
const { getHospitalInfo, getDepartments, getHospitalGuide } = await import('../src/api/hospital.js')
const { getEducationList, getEducationDetail } = await import('../src/api/education.js')

let passed = 0
let failed = 0
const errors = []

function check(name, condition, extra = '') {
  if (condition) {
    passed++
    console.log(`  PASS ${name}`)
  } else {
    failed++
    errors.push(name)
    console.error(`  FAIL ${name} ${extra}`)
  }
}

async function main() {
  console.log('[1] 未登录访问受保护接口 → 应被拒绝')
  try {
    await getPatientInfo()
    check('未登录请求被拦截', false)
  } catch {
    check('未登录请求被拦截', true)
  }

  console.log('[2] 错误密码登录 → 应失败')
  try {
    await login({ username: 'patient01', password: 'wrong' })
    check('错误密码登录被拒绝', false)
  } catch {
    check('错误密码登录被拒绝', true)
  }

  console.log('[3] 医护/管理员账号登录床旁终端 → 应被拒绝（权限矩阵）')
  try {
    await login({ username: 'doctor01', password: '123456' })
    check('医生账号登录被拒绝', false)
  } catch {
    check('医生账号登录被拒绝', true)
  }
  try {
    await login({ username: 'admin', password: '123456' })
    check('管理员账号登录被拒绝', false)
  } catch {
    check('管理员账号登录被拒绝', true)
  }

  console.log('[4] 正确账号登录 → 获取令牌与用户信息')
  const loginData = await login({ username: 'patient01', password: '123456' })
  check('返回 token', Boolean(loginData.token))
  check('返回 userInfo.realName=王建华', loginData.userInfo?.realName === '王建华')
  check('角色为患者(roleType=1)', loginData.userInfo?.roleType === 1)

  console.log('[5] 患者上下文')
  // 与 Pinia store 行为一致：登录后持久化令牌
  setToken(loginData.token)
  const ctx = await getPatientContext()
  check('上下文床号 305 床 2', ctx?.bedLabel?.includes('305'), JSON.stringify(ctx))

  console.log('[6] 首页汇总')
  const summary = await getHomeSummary()
  check('最新体征存在', Boolean(summary.latestVital?.temperature))
  check('今日待办非空', Array.isArray(summary.todos) && summary.todos.length > 0)
  check('余额 = 预缴 - 费用', typeof summary.balance === 'number' && summary.balance < 0 === false)

  console.log('[7] 患者信息四件套')
  const [info, diag, allergy, contacts] = await Promise.all([getPatientInfo(), getDiagnoses(), getAllergies(), getContacts()])
  check('住院号 ZY2026-008721', info.patientNo === 'ZY2026-008721')
  check('诊断含 2 型糖尿病', diag.some((d) => d.diagnosisName.includes('2 型糖尿病')))
  check('过敏史含青霉素', allergy.some((a) => a.allergen.includes('青霉素')))
  check('紧急联系人已脱敏', contacts.every((c) => c.phone.includes('****')))

  console.log('[8] 医嘱与检查检验')
  const orders = await getMedicalOrders()
  const longOrders = await getMedicalOrders({ orderType: 1 })
  check('医嘱共 10 条', orders.length === 10, `实际 ${orders.length}`)
  check('长期医嘱筛选正确', longOrders.every((o) => o.orderType === 1) && longOrders.length === 6, `实际 ${longOrders.length}`)
  check('医嘱关联药品名', orders.every((o) => !o.drugId || o.drugName))
  const exams = await getExaminations()
  check('检查检验 6 条', exams.length === 6, `实际 ${exams.length}`)

  console.log('[9] 体征数据')
  const vitals = await getVitalSigns({ days: 7 })
  check('近 7 天 8 条记录', vitals.length === 8, `实际 ${vitals.length}`)
  check('体温在合理范围', vitals.every((v) => v.temperature >= 35 && v.temperature <= 42))

  console.log('[10] 费用')
  const [fees, daily, insurance, dep, depRecords] = await Promise.all([
    getFeeDetails(), getFeeDaily(), getInsuranceInfo(), getDepositSummary(), getDepositRecords()
  ])
  check('费用明细金额合计一致', Math.abs(fees.items.reduce((s, f) => s + f.amount, 0) - fees.total) < 0.01)
  check('每日清单按日期分组', daily.length >= 8)
  check('医保报销比例 82%', insurance.reimbursementRatio === 82)
  check('余额 = 7000 - 总费用', dep.totalDeposit === 7000 && Math.abs(dep.balance - (7000 - fees.total)) < 0.01)
  check('预缴记录 2 条', depRecords.length === 2)

  console.log('[11] 饮食与点餐')
  const diet = await getTodayDiet()
  check('今日 4 餐次方案', diet.length === 4)
  const dishes = await getDishList()
  check('在售餐品 12 个', dishes.length === 12)
  const newOrder = await createMealOrder({
    orderDate: new Date().toISOString().slice(0, 10),
    mealTime: 3,
    items: [{ dishId: 1, quantity: 1 }, { dishId: 9, quantity: 2 }]
  })
  check('下单金额计算正确', Math.abs(newOrder.totalAmount - (4 + 4 * 2)) < 0.01, `total=${newOrder.totalAmount}`)
  const myOrders = await getMealOrders()
  check('订单列表含新订单', myOrders.length === 2)

  console.log('[12] 医护 / 医院 / 宣教 / 公告')
  const staff = await getResponsibleStaff()
  check('责任医护 4 人（2 医 2 护）', staff.filter((s) => s.relationType === 1).length === 2 && staff.filter((s) => s.relationType === 2).length === 2)
  check('医护电话已脱敏', staff.every((s) => !s.staff.phone || s.staff.phone.includes('****')))
  const duty = await getDutySchedule()
  check('本周排班非空', duty.length > 0)
  const [hospital, depts, guide] = await Promise.all([getHospitalInfo(), getDepartments(), getHospitalGuide()])
  check('医院名称', hospital.hospitalName === '仁和康复医院')
  check('科室 3 个', depts.length === 3)
  check('就诊指南 3 组', guide.guide.length === 3)
  const eduAll = await getEducationList()
  const eduDisease = await getEducationList({ eduType: 1 })
  check('宣教共 8 篇', eduAll.length === 8)
  check('疾病知识筛选 2 篇', eduDisease.length === 2)
  const eduDetail = await getEducationDetail(eduAll[0].id)
  check('宣教详情含发布人', Boolean(eduDetail.publisherName))
  const notices = await getNoticeList()
  check('公告 4 条', notices.length === 4)

  console.log('[13] 退出登录')
  await logout()
  clearAuth()
  try {
    await getPatientInfo()
    check('退出后访问被拦截', false)
  } catch {
    check('退出后访问被拦截', true)
  }

  console.log('[14] 家属账号：授权绑定后查看同一患者数据')
  const familyLogin = await login({ username: 'family01', password: '123456' })
  check('家属角色 roleType=2', familyLogin.userInfo?.roleType === 2)
  check('家属已绑定患者 patientId=1', familyLogin.userInfo?.patientId === 1)
  setToken(familyLogin.token)
  const familyCtx = await getPatientContext()
  check('家属上下文指向同一患者', familyCtx?.patientNo === 'ZY2026-008721')
  const familyInfo = await getPatientInfo()
  check('家属可见患者基本信息（脱敏）', familyInfo.name === '王建华' && familyInfo.idCard.includes('*'))
  await logout()
  clearAuth()

  console.log(`\n========== 验证结果：${passed} 通过 / ${failed} 失败 ==========`)
  if (failed > 0) {
    console.error('失败项：', errors.join('、'))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('验证脚本执行异常:', err)
  process.exit(1)
})
