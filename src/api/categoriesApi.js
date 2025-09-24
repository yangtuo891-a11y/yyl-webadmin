import { get, post, put, del } from '@/utils/requests'

// 获取类目列表
export function getCategoryList() {
  return get('/admin/categories')
}

// 添加类目
export function addCategory(data) {
  return post('/admin/categories', data)
}

// 修改类目
export function updateCategory(id, data) {
  return put(`/admin/categories/${id}`, data)
}

// 删除类目
export function deleteCategory(id) {
  return del(`/admin/categories/${id}`)
}