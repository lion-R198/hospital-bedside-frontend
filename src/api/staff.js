import request from '@/utils/request'

/** 责任医护团队 */
export function getResponsibleStaff() {
  return request({ url: '/staff/responsible', method: 'get' })
}

/** 责任医护本周排班 */
export function getDutySchedule() {
  return request({ url: '/staff/duty', method: 'get' })
}
