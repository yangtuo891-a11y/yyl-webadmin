import { get, post, put, del } from '@/utils/requests'

// 获取精品推荐列表
export function getFeaturedRecommendationList(params) {
  return get('/admin/featured-recommendations', params)
}

// 添加精品推荐
export function addFeaturedRecommendation(data) {
  return post('/admin/featured-recommendations', data)
}

// 更新精品推荐
export function updateFeaturedRecommendation(id, data) {
  return put(`/admin/featured-recommendations/${id}`, data)
}

// 删除精品推荐
export function deleteFeaturedRecommendation(id) {
  return del(`/admin/featured-recommendations/${id}`)
}

// 更新精品推荐状态
export function updateFeaturedRecommendationStatus(id, status) {
  return put(`/admin/featured-recommendations/${id}/status`, { status })
}

// 获取精品推荐详情
export function getFeaturedRecommendationDetail(id) {
  return get(`/admin/featured-recommendations/${id}`)
}

// 批量添加精品推荐
export function batchAddFeaturedRecommendations(productIds) {
  return post('/admin/featured-recommendations/batch', productIds)
}