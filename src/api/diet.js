import request from '@/utils/request'

/** 今日食谱 */
export function getTodayDiet() {
  return request({ url: '/diet/today', method: 'get' })
}

/** 营养方案 */
export function getNutritionPlan() {
  return request({ url: '/diet/nutrition', method: 'get' })
}

/** 饮食禁忌 */
export function getDietTaboos() {
  return request({ url: '/diet/taboos', method: 'get' })
}

/** 餐品列表（在线点餐） */
export function getDishList() {
  return request({ url: '/dishes', method: 'get' })
}

/** 我的点餐订单 */
export function getMealOrders() {
  return request({ url: '/meal-orders', method: 'get' })
}

/** 提交点餐订单 */
export function createMealOrder(data) {
  return request({ url: '/meal-orders', method: 'post', data })
}

/** 取消点餐订单 */
export function cancelMealOrder(id) {
  return request({ url: `/meal-orders/${id}/cancel`, method: 'post' })
}
