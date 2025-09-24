import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    if (import.meta.env.DEV) {
      console.error('请求错误：', error)
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, data, message, msg } = response.data
    
    if (import.meta.env.DEV) {
      console.log('API响应:', response.data)
    }
    
    // 修复：后端返回的成功码是字符串"0"，不是数字200
    if (code === "0" || code === 0) {
      return data
    } else {
      const errorMsg = message || msg || '请求失败'
      
      // 处理未登录状态 - 后端返回code="405"表示未登录
      if (code === "405" || code === 405) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(new Error('未登录'))
      }
      
      if (import.meta.env.DEV) {
        console.error('API错误:', errorMsg)
      }
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
  },
  error => {
    if (import.meta.env.DEV) {
      console.error('响应错误：', error)
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service

// 添加具名导出方法
export const get = (url, params) => {
  return service({
    url,
    method: 'get',
    params
  })
}

export const post = (url, data) => {
  return service({
    url,
    method: 'post',
    data
  })
}

export const put = (url, data) => {
  return service({
    url,
    method: 'put',
    data
  })
}

export const del = (url) => {
  return service({
    url,
    method: 'delete'
  })
}