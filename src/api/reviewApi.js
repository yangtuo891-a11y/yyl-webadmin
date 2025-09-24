import { get, del } from '../utils/requests'

// 获取商品评价列表
export function getReviewList(params) {
  return get('/admin/product/comments', params)
}

// 删除商品评价
export function deleteReview(reviewId) {
  return del(`/admin/product/comments/${reviewId}`)
}

// 批量删除所有评论
export function deleteAllReviews() {
  return del('/admin/product/comments-all')
}