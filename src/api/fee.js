import request from '@/utils/request'

/** 费用明细（可按日期筛选），返回 { items, total } */
export function getFeeDetails(params) {
  return request({ url: '/fees', method: 'get', params })
}

/** 每日费用汇总 */
export function getFeeDaily() {
  return request({ url: '/fees/daily', method: 'get' })
}

/** 医保信息 */
export function getInsuranceInfo() {
  return request({ url: '/insurance', method: 'get' })
}

/** 预缴金汇总（总额/已用/余额/欠费预警） */
export function getDepositSummary() {
  return request({ url: '/deposit/summary', method: 'get' })
}

/** 预缴金记录 */
export function getDepositRecords() {
  return request({ url: '/deposit/records', method: 'get' })
}
