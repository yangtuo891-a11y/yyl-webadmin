import { get, post, put, del } from '@/utils/requests'

// 获取公告列表
export function getArticleList(params) {
  return get('/admin/article', params)
}

// 添加公告
export function addArticle(data) {
  return post('/admin/article', data)
}

// 更新公告
export function updateArticle(data) {
  return put(`/admin/article`, data)
}

// 删除公告
export function deleteArticle(id) {
  return del(`/admin/article/${id}`)
}

// 获取公告详情
export function getArticleDetail(id) {
  return get(`/admin/article/detail/${id}`)
}