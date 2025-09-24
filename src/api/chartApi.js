import { get } from '@/utils/requests'

// 获取订单统计数据
export function getOrderStats(timeRange) {
  return get('/admin/user/count-order-week', {
    timeRange // week, month, year
  })
}

// 获取销售额统计数据
export function getSalesStats(timeRange) {
  return get('/admin/user/count-ammout-week', {
    timeRange // week, month, year
  })
}