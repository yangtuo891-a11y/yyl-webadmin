import { get, post, put, del } from '@/utils/requests'

// 获取用户列表
export function getUserList(params) {
  return get('/admin/user', params)
}

// 更新用户状态
export function updateUserStatus(userId, disabled) {
  return put(`/admin/user/state/${userId}`, { disabled })
}

// 获取用户详情
export function getUserDetail(userId) {
  return get(`/api/users/${userId}`)
}

// 获取用户收藏列表
export function getUserFavorites(params) {
  return get(`/admin/collect/${params.userId}`, {
    page: params.page,
    size: params.size
  })
}

export function countUser() {
  return get('/admin/user/count-user')
}

export function countOrder() {
  return get('/admin/user/count-order')
}

export function countComments() {
  return get('/admin/user/count-comments')
}

export function countTodayAmmout() {
  return get('/admin/user/count-today-ammout')
}

export function countUnsendOrder() {
  return get('/admin/user/count-unsend-order')
}

export function countRefundOrder() {
  return get('/admin/user/count-refund-order')
}

