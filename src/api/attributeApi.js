import { get, post, put, del } from '@/utils/requests'

// 获取规格字典列表
export function getAttributeList() {
  return get('/admin/skuconfig/product-attr-config')
}

// 添加规格字典
export function addAttribute(data) {
  return post('/admin/skuconfig/product-attr-config', data)
}

// 更新规格字典
export function updateAttribute(id, data) {
  return put(`/admin/skuconfig/product-attr-config/${id}`, data)
}

// 删除规格字典
export function deleteAttribute(id) {
  return del(`/admin/skuconfig/product-attr-config/${id}`)
}