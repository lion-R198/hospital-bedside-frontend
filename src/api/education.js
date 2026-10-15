import request from '@/utils/request'

/** 宣教列表（可按类型筛选） */
export function getEducationList(params) {
  return request({ url: '/education', method: 'get', params })
}

/** 宣教详情 */
export function getEducationDetail(id) {
  return request({ url: `/education/${id}`, method: 'get' })
}
