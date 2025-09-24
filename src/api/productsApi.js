import { get, post, put, del } from '@/utils/requests'

// 获取商品列表
export function getProductList(data) {
  return post('/admin/product/list', data)
}

// 获取商品详情
export function getProductDetail(id) {
  return post(`/admin/product/${id}`)
}

// 新增商品
export function addProduct(data) {
  return post('/admin/product/add', data)
}

// 更新商品
export function updateProduct(id, data) {
  return put(`/admin/product/update/${id}`, data)
}

// 删除商品
export function deleteProduct(id) {
  return del(`/admin/product/${id}`)
}

// 更新商品状态（上架/下架）
export function updateProductStatus(id, state) {
  return post(`/admin/product/toggle-status/${id}`, { 'state': state })
}

export function getProductListBySelector(data) {
  return post('/admin/product/list-selector', data)
}

// 更新商品库存
export function updateProductStock(id, productNum) {
  return post('/admin/product/change-stock', { 
    'id': id,
    'spuStock': productNum 
  })
}

// 获取商品SPU列表
export function getProductSpuList(productId) {
  return get(`/admin/product/spu/list/${productId}`)
}

export function getProductSpuStockList(params) {
  return get('/admin/product/spu/stock-list', params)
}

// 添加商品SPU
export function addProductSpu(data) {
  return post('/admin/product/spu/add', data)
}

// 更新商品SPU
export function updateProductSpu(id, data) {
  return put(`/admin/product/spu/update/${id}`, data)
}

// 删除商品SPU
export function deleteProductSpu(id) {
  return del(`/admin/product/spu/${id}`)
}



