import request from '@/utils/request'

/** 体征记录（days: 近 N 天） */
export function getVitalSigns(params) {
  return request({ url: '/vitals', method: 'get', params })
}
