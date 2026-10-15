import request from '@/utils/request'

/** 通知公告列表 */
export function getNoticeList() {
  return request({ url: '/notices', method: 'get' })
}
