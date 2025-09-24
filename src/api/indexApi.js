import { get, post, put, del } from '@/utils/requests'

// 获取服装类型名称列表
export function getClothingTypeNames() {
  return get('/admin/index-type/type-names')
}

// 获取服装类型列表
export function getClothingTypes() {
  return get('/admin/index-type')
}

// 添加服装类型
export function addClothingType(data) {
  return post('/admin/index-type', data)
}

// 更新服装类型
export function updateClothingType(data) {
  return put('/admin/index-type', data)
}

// 删除服装类型
export function deleteClothingType(id) {
  return del(`/admin/index-type/${id}`)
}

// 获取品牌推荐列表
export function getBrandRecommends() {
  return get('/admin/index-brand')
}

// 添加品牌推荐
export function addBrandRecommend(data) {
  return post('/admin/index-brand', data)
}

// 更新品牌推荐
export function updateBrandRecommend(data) {
  return put('/admin/index-brand', data)
}

// 删除品牌推荐
export function deleteBrandRecommend(id) {
  return del(`/admin/index-brand/${id}`)
}

// 获取品牌名称列表
export function getBrandNames() {
  return get('/admin/index-brand/type-names')
}