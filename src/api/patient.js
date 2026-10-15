import request from '@/utils/request'

/** 患者基本信息 + 住院信息 */
export function getPatientInfo() {
  return request({ url: '/patient/info', method: 'get' })
}

/** 诊断记录 */
export function getDiagnoses() {
  return request({ url: '/patient/diagnoses', method: 'get' })
}

/** 过敏史 */
export function getAllergies() {
  return request({ url: '/patient/allergies', method: 'get' })
}

/** 家属/紧急联系人 */
export function getContacts() {
  return request({ url: '/patient/contacts', method: 'get' })
}
