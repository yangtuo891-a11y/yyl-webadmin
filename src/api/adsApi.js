import { get, post, put, del } from '@/utils/requests'

// 获取广告列表
export function getAdsList() {
  return get('/admin/index-carousel')
}

// 添加广告
export function addAd(data) {
  return post('/admin/index-carousel', data)
}

// 更新广告
export function updateAd(id, data) {
  return put(`/admin/index-carousel/${id}`, data)
}

// 删除广告
export function deleteAd(id) {
  return del(`/admin/index-carousel/${id}`)
}