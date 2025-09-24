import { get, post, put, del } from '@/utils/requests'

// 获取规格字典列表
export function getSpecDictList() {
  return get('/admin/skuconfig')
}

// 添加规格字典
export function addSpecDict(data) {
  return post('/admin/skuconfig', data)
}

// 更新规格字典
export function updateSpecDict(id, data) {
  return put(`/admin/skuconfig/${id}`, data)
}

// 删除规格字典
export function deleteSpecDict(id) {
  return del(`/admin/skuconfig/${id}`)
}