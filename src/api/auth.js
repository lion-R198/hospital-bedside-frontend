import request from '@/utils/request'

/** 登录 */
export function login(data) {
  return request({ url: '/auth/login', method: 'post', data })
}

/** 退出登录 */
export function logout() {
  return request({ url: '/auth/logout', method: 'post' })
}

/** 获取当前患者上下文（患者/家属） */
export function getPatientContext() {
  return request({ url: '/auth/patient-context', method: 'get' })
}
