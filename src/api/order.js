import request from '@/utils/request'

/** 医嘱列表（可按类型/类别/状态筛选） */
export function getMedicalOrders(params) {
  return request({ url: '/orders', method: 'get', params })
}

/** 检查检验列表 */
export function getExaminations(params) {
  return request({ url: '/examinations', method: 'get', params })
}
