import request from '@/utils/request'

/** 首页今日概览（最新体征、费用/余额、今日待办） */
export function getHomeSummary() {
  return request({ url: '/home/summary', method: 'get' })
}
