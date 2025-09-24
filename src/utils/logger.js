// 统一的日志工具
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  
  error: (...args) => {
    console.error(...args)
    // 在生产环境中可以发送错误到监控系统
    if (process.env.NODE_ENV === 'production') {
      // TODO: 集成错误监控服务
    }
  },
  
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  },
  
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args)
    }
  }
}

// 默认导出
export default logger