/**
 * 图片处理工具类
 * 提供图片压缩、格式转换、懒加载等功能
 */

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<Blob>} - 压缩后的图片
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(resolve, format, quality)
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 图片懒加载观察器
 */
class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    )
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          img.classList.remove('lazy-loading')
          img.classList.add('lazy-loaded')
          this.observer.unobserve(img)
        }
      }
    })
  }

  observe(img) {
    img.classList.add('lazy-loading')
    this.observer.observe(img)
  }

  disconnect() {
    this.observer.disconnect()
  }
}

// 创建全局懒加载实例
export const lazyLoader = new ImageLazyLoader()

/**
 * 预加载图片
 * @param {string|Array} urls - 图片URL或URL数组
 * @returns {Promise} - 预加载完成的Promise
 */
export function preloadImages(urls) {
  const urlArray = Array.isArray(urls) ? urls : [urls]
  
  const promises = urlArray.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })

  return Promise.all(promises)
}

/**
 * 获取图片主色调
 * @param {string} imageUrl - 图片URL
 * @returns {Promise<string>} - 主色调的hex值
 */
export function getImageDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      let r = 0, g = 0, b = 0
      const pixelCount = data.length / 4
      
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      
      r = Math.floor(r / pixelCount)
      g = Math.floor(g / pixelCount)
      b = Math.floor(b / pixelCount)
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      resolve(hex)
    }
    
    img.onerror = reject
    img.src = imageUrl
  })
}

/**
 * 图片格式检测
 * @param {File} file - 图片文件
 * @returns {boolean} - 是否为支持的图片格式
 */
export function isValidImageFormat(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return validTypes.includes(file.type)
}

/**
 * 图片尺寸验证
 * @param {File} file - 图片文件
 * @param {Object} constraints - 尺寸约束
 * @returns {Promise<boolean>} - 是否符合尺寸要求
 */
export function validateImageDimensions(file, constraints = {}) {
  const { minWidth = 0, minHeight = 0, maxWidth = Infinity, maxHeight = Infinity } = constraints
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      const isValid = width >= minWidth && height >= minHeight && 
                     width <= maxWidth && height <= maxHeight
      resolve(isValid)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 生成缩略图
 * @param {File} file - 原始图片文件
 * @param {number} size - 缩略图尺寸
 * @returns {Promise<string>} - 缩略图的data URL
 */
export function generateThumbnail(file, size = 150) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // 计算裁剪区域（居中裁剪）
      const { width, height } = img
      const minDimension = Math.min(width, height)
      const x = (width - minDimension) / 2
      const y = (height - minDimension) / 2

      ctx.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}