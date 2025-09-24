import { post } from '@/utils/requests'

export function login(data) {
  return post('/admin/login', data)
}

export function logout() {
  return post('/admin/logout')
}

export function getAdminInfo() {
  return post('/admin/info')
}