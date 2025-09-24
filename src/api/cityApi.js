import { get } from '@/utils/requests'

// 获取所有省市区数据
export function getCityList() {
  return get('/admin/skuconfig/city')
}