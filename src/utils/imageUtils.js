/**
 * 图片URL处理工具
 */

// 获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * 处理图片URL，确保返回完整的可访问URL
 * @param {string} imageUrl - 原始图片URL
 * @returns {string} - 处理后的完整图片URL
 */
export function processImageUrl(imageUrl) {
  if (!imageUrl) {
    return getPlaceholderImage()
  }

  // 如果是data URL（base64图片），直接返回
  if (imageUrl.startsWith('data:')) {
    return imageUrl
  }
  
  // 如果已经是完整的URL，保持原样
  if (imageUrl.startsWith('http://')) {
    return imageUrl
  }

  // 如果已经是完整的URL（包含http或https），直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // 如果是相对路径，拼接完整URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`
  }

  // 如果只是文件名，拼接完整路径
  if (!imageUrl.startsWith('/')) {
    return `${API_BASE_URL}/uploads/${imageUrl}`
  }

  // 其他情况，尝试拼接API基础URL
  return `${API_BASE_URL}${imageUrl}`
}

/**
 * 获取占位图片
 * @returns {string} - 占位图片的data URL
 */
export function getPlaceholderImage() {
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjFmNWY5O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2UyZThmMDtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNncmFkKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj7llYblk4Hlm77niYc8L3RleHQ+PC9zdmc+'
}

/**
 * 检查图片URL是否有效
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<boolean>} - 图片是否可访问
 */
export function checkImageUrl(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

/**
 * 预加载图片
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<string>} - 预加载完成后返回图片URL
 */
export function preloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(imageUrl)
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`))
    img.src = processImageUrl(imageUrl)
  })
}