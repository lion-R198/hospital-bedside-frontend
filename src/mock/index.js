/**
 * Mock 适配层
 * 模拟后端接口契约：{ code, msg, data } 统一响应结构、Bearer 令牌校验、
 * 网络延迟与业务错误。切换真实 API 时仅需将 VITE_USE_MOCK 置为 false。
 */
import { ElMessage } from 'element-plus'
import * as org from './data/org'
import * as med from './data/medical'
import * as svc from './data/service'
import { today, dayOffset } from './utils/date'
import { getToken } from '@/utils/auth'

const RESPONSE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
}

/** 生成模拟令牌（模仿 JWT 三段式结构，仅用于前端演示） */
const issuedTokens = new Map()

class BizError extends Error {
  constructor(code, msg) {
    super(msg)
    this.code = code
  }
}

// ---------------- 工具函数 ----------------
/** 从模拟令牌中解析当前用户（模拟后端 JWT 解码过程） */
function currentUserByToken(token) {
  try {
    const userId = Number(token.split('.')[1])
    return org.sysUsers.find((u) => u.id === userId) || null
  } catch {
    return null
  }
}

function requireToken() {
  const token = getToken()
  // 校验 Bearer 令牌格式（模拟 JWT 签名校验）；页面刷新后仍有效的持久化令牌同样放行
  if (!token || !token.startsWith('mock-jwt.')) {
    throw new BizError(RESPONSE.UNAUTHORIZED, '令牌无效或已过期')
  }
  return token
}

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k]
    return acc
  }, {})
}

/** 医护信息（脱敏，姓名/职称/专长等面向患者的字段） */
function staffVO(id) {
  const s = org.medicalStaffs.find((i) => i.id === id)
  if (!s) return null
  return {
    id: s.id,
    staffNo: s.staffNo,
    name: s.name,
    gender: s.gender,
    staffType: s.staffType,
    title: s.title,
    departmentId: s.departmentId,
    wardId: s.wardId,
    specialty: s.specialty,
    phone: s.phone ? s.phone.slice(0, 3) + '****' + s.phone.slice(-4) : null
  }
}

function feeVO(fee) {
  const item = svc.chargeItems.find((i) => i.id === fee.chargeItemId)
  return {
    id: fee.id,
    itemName: item?.itemName || '-',
    itemCategory: item?.itemCategory ?? 7,
    unit: item?.unit,
    quantity: fee.quantity,
    price: fee.price,
    amount: fee.amount,
    chargeDate: fee.chargeDate,
    chargeTime: fee.chargeTime,
    feeStatus: fee.feeStatus
  }
}

function patientVO() {
  const p = org.patient
  const dept = org.departments.find((d) => d.id === p.departmentId)
  const ward = org.wards.find((w) => w.id === p.wardId)
  const bed = org.beds.find((b) => b.id === p.bedId)
  return {
    ...p,
    // 敏感信息在数据层统一脱敏（安全需求：诊断、费用、体征等敏感信息脱敏展示）
    idCard: p.idCard ? p.idCard.slice(0, 4) + '**********' + p.idCard.slice(-4) : null,
    phone: p.phone ? p.phone.slice(0, 3) + '****' + p.phone.slice(-4) : null,
    departmentName: dept?.deptName || '-',
    wardName: ward?.wardName || '-',
    wardLocation: ward?.location || '-',
    bedLabel: bed ? `${bed.roomNo} 床 ${bed.bedNo}` : '-'
  }
}

// ---------------- Mock 路由表 ----------------
const handlers = new Map()
function route(method, url, handler, { auth = true } = {}) {
  handlers.set(`${method} ${url}`, { handler, auth })
}

// ---------- 认证模块 ----------
route('POST', '/auth/login', ({ body }) => {
  const { username, password } = body || {}
  const user = org.sysUsers.find((u) => u.username === username)
  if (!user || user.password !== password) {
    throw new BizError(500, '用户名或密码错误')
  }
  if (user.status !== 1) {
    throw new BizError(500, '账号已被禁用，请联系管理员')
  }
  if ([3, 4].includes(user.roleType)) {
    throw new BizError(500, '医护账号请使用医护工作站登录，床旁终端仅面向患者与家属')
  }
  if (user.roleType === 5) {
    throw new BizError(500, '管理员账号请使用后台管理系统登录')
  }
  const token = `mock-jwt.${user.id}.${Date.now()}`
  issuedTokens.set(token, user)
  const userInfo = pick(user, ['id', 'username', 'realName', 'roleType', 'patientId', 'staffId'])
  return { token, expiresIn: 7200, userInfo }
}, { auth: false })

route('POST', '/auth/logout', () => {
  const token = getToken()
  issuedTokens.delete(token)
  return null
})

route('GET', '/auth/patient-context', () => {
  const token = requireToken()
  const user = currentUserByToken(token)
  if (!user?.patientId) return null
  const p = patientVO()
  return {
    patientId: p.id,
    patientNo: p.patientNo,
    name: p.name,
    gender: p.gender,
    bedLabel: p.bedLabel,
    wardName: p.wardName,
    departmentName: p.departmentName
  }
})

// ---------- 首页 ----------
route('GET', '/home/summary', () => {
  requireToken()
  const latestVital = med.vitalSigns[med.vitalSigns.length - 1]
  const totalFee = svc.feeDetails.reduce((s, f) => s + f.amount, 0)
  const totalDeposit = svc.deposits.filter((d) => d.depositType === 1).reduce((s, d) => s + d.amount, 0)
  // 待办：今日待执行医嘱 + 近期检查
  const todos = []
  med.medicalOrders
    .filter((o) => o.patientId === 1 && (o.status === 0 || o.status === 1) && (o.startTime || '').startsWith(today()))
    .forEach((o) => {
      todos.push({
        type: 'order',
        typeLabel: '医嘱',
        title: o.orderContent,
        time: (o.startTime || '').slice(11, 16),
        status: o.status
      })
    })
  med.examinations
    .filter((e) => e.patientId === 1 && e.resultStatus !== 2 && (e.scheduledTime || '').slice(0, 10) >= today())
    .slice(0, 3)
    .forEach((e) => {
      todos.push({
        type: 'exam',
        typeLabel: e.examType === 1 ? '检查' : '检验',
        title: e.examName,
        time: (e.scheduledTime || '').slice(11, 16),
        status: e.resultStatus
      })
    })
  todos.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  return {
    latestVital,
    totalFee: Number(totalFee.toFixed(2)),
    balance: Number((totalDeposit - totalFee).toFixed(2)),
    todos
  }
})

// ---------- 通知公告 ----------
route('GET', '/notices', () => {
  requireToken()
  return [...svc.notices].sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''))
})

// ---------- 患者信息 ----------
route('GET', '/patient/info', () => {
  requireToken()
  return patientVO()
})
route('GET', '/patient/diagnoses', () => {
  requireToken()
  return med.diagnoses.map((d) => ({
    ...d,
    doctorName: org.medicalStaffs.find((s) => s.id === d.doctorId)?.name || '-'
  }))
})
route('GET', '/patient/allergies', () => {
  requireToken()
  return med.allergyHistories
})
route('GET', '/patient/contacts', () => {
  requireToken()
  return org.familyContacts.map((c) => ({
    ...c,
    phone: c.phone.slice(0, 3) + '****' + c.phone.slice(-4)
  }))
})

// ---------- 我的医嘱 ----------
route('GET', '/orders', ({ query }) => {
  requireToken()
  let list = med.medicalOrders.filter((o) => o.patientId === 1)
  if (query.orderType) list = list.filter((o) => o.orderType === Number(query.orderType))
  if (query.orderCategory) list = list.filter((o) => o.orderCategory === Number(query.orderCategory))
  if (query.status) list = list.filter((o) => o.status === Number(query.status))
  return list
    .map((o) => ({
      ...o,
      drugName: o.drugId ? med.drugs.find((d) => d.id === o.drugId)?.drugName : null,
      doctorName: org.medicalStaffs.find((s) => s.id === o.doctorId)?.name || '-',
      nurseName: o.nurseId ? org.medicalStaffs.find((s) => s.id === o.nurseId)?.name || '-' : null
    }))
    .sort((a, b) => (b.startTime || '').localeCompare(a.startTime || ''))
})

route('GET', '/examinations', ({ query }) => {
  requireToken()
  let list = med.examinations.filter((e) => e.patientId === 1)
  if (query.examType) list = list.filter((e) => e.examType === Number(query.examType))
  return list
    .map((e) => ({ ...e, doctorName: org.medicalStaffs.find((s) => s.id === e.doctorId)?.name || '-' }))
    .sort((a, b) => (b.scheduledTime || '').localeCompare(a.scheduledTime || ''))
})

// ---------- 体征数据 ----------
route('GET', '/vitals', ({ query }) => {
  requireToken()
  let list = med.vitalSigns.filter((v) => v.patientId === 1)
  if (query.days) {
    const from = dayOffset(-Number(query.days))
    list = list.filter((v) => v.measureTime.slice(0, 10) >= from)
  }
  return list.sort((a, b) => a.measureTime.localeCompare(b.measureTime))
})

// ---------- 费用清单 ----------
route('GET', '/fees', ({ query }) => {
  requireToken()
  let list = svc.feeDetails.filter((f) => f.patientId === 1)
  if (query.chargeDate) list = list.filter((f) => f.chargeDate === query.chargeDate)
  const items = list.map(feeVO)
  const total = Number(items.reduce((s, f) => s + f.amount, 0).toFixed(2))
  return { items, total }
})

route('GET', '/fees/daily', () => {
  requireToken()
  const byDate = new Map()
  svc.feeDetails
    .filter((f) => f.patientId === 1)
    .forEach((f) => {
      if (!byDate.has(f.chargeDate)) byDate.set(f.chargeDate, { chargeDate: f.chargeDate, count: 0, total: 0 })
      const d = byDate.get(f.chargeDate)
      d.count += 1
      d.total = Number((d.total + f.amount).toFixed(2))
    })
  return [...byDate.values()].sort((a, b) => b.chargeDate.localeCompare(a.chargeDate))
})

route('GET', '/insurance', () => {
  requireToken()
  return svc.insuranceInfo
})

route('GET', '/deposit/summary', () => {
  requireToken()
  const totalDeposit = svc.deposits.filter((d) => d.patientId === 1 && d.depositType === 1).reduce((s, d) => s + d.amount, 0)
  const totalFee = svc.feeDetails.filter((f) => f.patientId === 1).reduce((s, f) => s + f.amount, 0)
  const balance = Number((totalDeposit - totalFee).toFixed(2))
  return {
    totalDeposit: Number(totalDeposit.toFixed(2)),
    totalUsed: Number(totalFee.toFixed(2)),
    balance,
    lowBalanceWarn: balance < 1000
  }
})

route('GET', '/deposit/records', () => {
  requireToken()
  return svc.deposits
    .filter((d) => d.patientId === 1)
    .sort((a, b) => (b.depositTime || '').localeCompare(a.depositTime || ''))
})

// ---------- 饮食建议 ----------
route('GET', '/diet/today', () => {
  requireToken()
  return svc.dietPlans.filter((d) => d.patientId === 1 && d.planDate === today())
})

route('GET', '/diet/nutrition', () => {
  requireToken()
  return svc.nutritionPlan
})

route('GET', '/diet/taboos', () => {
  requireToken()
  return svc.dietTaboos
})

// ---------- 点餐 ----------
route('GET', '/dishes', () => {
  requireToken()
  return svc.dishes.filter((d) => d.status === 1)
})

route('GET', '/meal-orders', () => {
  requireToken()
  return svc.mealOrders
    .filter((o) => o.patientId === 1)
    .sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
})

route('POST', '/meal-orders', ({ body }) => {
  requireToken()
  const { orderDate, mealTime, items } = body || {}
  if (!items || items.length === 0) throw new BizError(500, '请先选择餐品')
  const id = svc.mealOrders.length + 1
  const mapped = items.map((it, idx) => {
    const dish = svc.dishes.find((d) => d.id === it.dishId)
    if (!dish) throw new BizError(500, '餐品不存在或已下架')
    return {
      id: idx + 1,
      orderId: id,
      dishId: dish.id,
      dishName: dish.dishName,
      quantity: it.quantity,
      price: dish.price,
      amount: Number((dish.price * it.quantity).toFixed(2))
    }
  })
  const total = Number(mapped.reduce((s, i) => s + i.amount, 0).toFixed(2))
  const order = {
    id,
    orderNo: `DC${orderDate.replace(/-/g, '')}${String(id).padStart(6, '0')}`,
    patientId: 1,
    orderDate,
    mealTime,
    totalAmount: total,
    status: 0,
    items: mapped
  }
  svc.mealOrders.push(order)
  return order
})

route('POST', '/meal-orders/:id/cancel', ({ params }) => {
  requireToken()
  const order = svc.mealOrders.find((o) => o.id === Number(params.id))
  if (!order) throw new BizError(500, '订单不存在')
  if (order.status !== 0) throw new BizError(500, '仅「待确认」订单可取消')
  order.status = 3
  return order
})

// ---------- 我的医护 ----------
route('GET', '/staff/responsible', () => {
  requireToken()
  const relations = org.patientStaffs.filter((r) => r.patientId === 1)
  return relations.map((r) => ({
    ...r,
    staff: staffVO(r.staffId)
  }))
})

route('GET', '/staff/duty', () => {
  requireToken()
  return svc.dutySchedules
    .map((d) => ({ ...d, staff: staffVO(d.staffId) }))
    .sort((a, b) => a.dutyDate.localeCompare(b.dutyDate))
})

// ---------- 医院介绍 ----------
route('GET', '/hospital/info', () => {
  requireToken()
  return org.hospital
})

route('GET', '/hospital/departments', () => {
  requireToken()
  return org.departments
})

route('GET', '/hospital/guide', () => {
  requireToken()
  return { guide: svc.hospitalGuide, floorMap: svc.floorMap }
})

// ---------- 健康宣教 ----------
route('GET', '/education', ({ query }) => {
  requireToken()
  let list = svc.healthEducations.filter((e) => e.status === 1)
  if (query.eduType) list = list.filter((e) => e.eduType === Number(query.eduType))
  return list
    .map((e) => ({
      id: e.id,
      title: e.title,
      eduType: e.eduType,
      diseaseName: e.diseaseName,
      publishTime: e.publishTime,
      viewCount: e.viewCount,
      content: e.content
    }))
    .sort((a, b) => (b.publishTime || '').localeCompare(a.publishTime || ''))
})

route('GET', '/education/:id', ({ params }) => {
  requireToken()
  const item = svc.healthEducations.find((e) => e.id === Number(params.id))
  if (!item) throw new BizError(500, '宣教内容不存在')
  item.viewCount += 1
  const publisher = org.medicalStaffs.find((s) => s.id === item.publisherId)
  return { ...item, publisherName: publisher?.name || '-' }
})

// ---------------- 分发器 ----------------
function matchRoute(method, url) {
  for (const [key, val] of handlers) {
    const [m, pattern] = key.split(' ')
    if (m !== method) continue
    const patternParts = pattern.split('/')
    const urlParts = url.split('/')
    if (patternParts.length !== urlParts.length) continue
    const params = {}
    const matched = patternParts.every((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(urlParts[i])
        return true
      }
      return seg === urlParts[i]
    })
    if (matched) return { ...val, params }
  }
  return null
}

/** 模拟请求入口：与 axios request(config) 同参 */
export async function mockRequest(config) {
  const { url = '', method = 'get', params = {}, data = {} } = config
  const cleanUrl = url.split('?')[0]
  const matched = matchRoute(method.toUpperCase(), cleanUrl)

  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 220))

  if (!matched) {
    const msg = `Mock 接口未实现: ${method.toUpperCase()} ${cleanUrl}`
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  }

  // 模拟 Bearer 令牌校验（登录接口除外）
  if (matched.auth && !getToken()) {
    ElMessage.error('登录状态已失效，请重新登录')
    return Promise.reject(new BizError(RESPONSE.UNAUTHORIZED, '未登录'))
  }

  try {
    const body = typeof data === 'string' ? JSON.parse(data) : data
    const result = await matched.handler({ query: params || {}, body, params: matched.params })
    // 与 axios 响应拦截器保持一致：成功时仅返回 data，业务码非 200 时抛错
    return result
  } catch (err) {
    if (err instanceof BizError) {
      if (err.code === RESPONSE.UNAUTHORIZED) {
        ElMessage.error('登录状态已失效，请重新登录')
      } else {
        ElMessage.error(err.message)
      }
      return Promise.reject(err)
    }
    ElMessage.error('服务异常，请稍后重试')
    return Promise.reject(err)
  }
}
