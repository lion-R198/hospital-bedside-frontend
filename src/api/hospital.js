import request from '@/utils/request'

/** 医院概况 */
export function getHospitalInfo() {
  return request({ url: '/hospital/info', method: 'get' })
}

/** 科室介绍 */
export function getDepartments() {
  return request({ url: '/hospital/departments', method: 'get' })
}

/** 就诊指南与楼层分布 */
export function getHospitalGuide() {
  return request({ url: '/hospital/guide', method: 'get' })
}
