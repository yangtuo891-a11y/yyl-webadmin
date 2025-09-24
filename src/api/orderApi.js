import { get, post, put, del } from '@/utils/requests'

// 获取订单列表
export function getOrders(params) {
  return post('/order/admin/order', {
    page: params.pageNum,
    pageSize: params.pageSize,
    orderId: params.orderNo,
    orderState: params.status,
    startTime: params.startTime,
    endTime: params.endTime,
    shippingFilter: params.shippingFilter,
    refundFilter: params.refundFilter
  })
}

// 获取订单详情
export function getOrderDetail(orderId) {
  return get(`/order/admin/order/detail/${orderId}`)
}

// 更新订单状态
export function updateOrderStatus(orderId, data) {
  return put(`/orders/${orderId}/status`, data)
}

// 发货
export function shipOrder(orderId) {
  return post(`/order/admin/order/send-order/${orderId}`)
}

// 审核退款
export function approveRefund(orderId, data) {
  return post(`/order/admin/approve-refund/${orderId}`, data)
}

// 取消退款
export function cancelRefund(orderId) {
  return post(`/order/cancel-refund/${orderId}`)
}