<template>
  <el-container class="app-wrapper">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-container">
      <div class="logo-container">
        <img src="https://cdn-icons-png.flaticon.com/512/3724/3724763.png" class="logo-image" />
        <h1 class="logo-title" v-show="!isCollapse">生鲜超市管理</h1>
      </div>
      <el-menu
        class="sidebar-menu"
        :default-active="$route.path"
        background-color="#52c41a"
        text-color="#ffffff"
        active-text-color="#ffffff"
        :collapse="isCollapse"
        router
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-sub-menu index="/home-manage">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>首页管理</span>
          </template>
          <el-menu-item index="/home-manage/ads">广告位管理</el-menu-item>
          <!-- <el-menu-item index="/home-manage/brand-recommend">推荐管理</el-menu-item> -->
        </el-sub-menu>
        <el-sub-menu index="/categories">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>类目管理</span>
          </template>
          <el-menu-item index="/categories">类目列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/dict">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>字典管理</span>
          </template>
          <el-menu-item index="/dict/spec">标签字典</el-menu-item>
          <el-menu-item index="/dict/attr">商品属性字典</el-menu-item>
        </el-sub-menu>
       
        <el-sub-menu index="/products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/products">商品列表</el-menu-item>
          <el-menu-item index="/products/stock">库存管理</el-menu-item>
          <el-menu-item index="/products/reviews">评价管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/featured-recommendation">
          <el-icon><Star /></el-icon>
          <span>精品推荐</span>
        </el-menu-item>

        <!-- 运费管理功能已移除 -->
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item index="/announcement">
          <el-icon><Bell /></el-icon>
          <span>资讯管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="60px" class="header">
        <div class="header-left">
          <el-button 
            type="text" 
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <el-icon size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <breadcrumb class="breadcrumb" />
        </div>
        <div class="header-right">
          <el-button 
            type="text" 
            class="message-btn"
            @click="goToMessages"
          >
            <div class="message-icon-wrapper">
              <el-icon size="18"><Bell /></el-icon>
              <span v-if="hasNewMessage" class="message-dot"></span>
            </div>
            <span class="message-text">消息</span>
          </el-button>
          <el-dropdown>
            <div class="user-dropdown">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="el-dropdown-link">
                管理员
                <el-icon><ArrowDown /></el-icon>
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
        
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main :style="{ marginLeft: isCollapse ? '64px' : '220px' }">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { House, Picture, Menu as MenuIcon, Star, Goods, List, User, ArrowDown, Setting, Van, Bell, ChatDotRound, Fold, Expand } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const websocket = ref(null)
const isConnected = ref(false)
const hasNewMessage = ref(false)
const isCollapse = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// WebSocket连接函数
const connectWebSocket = () => {
  try {
    // 使用环境变量配置WebSocket地址
    const wsUrl = import.meta.env.VITE_WS_BASE_URL
    websocket.value = new WebSocket(wsUrl)
    
    websocket.value.onopen = () => {
      console.log('WebSocket连接已建立')
      isConnected.value = true
    }
    
    websocket.value.onmessage = (event) => {
      console.log('收到WebSocket消息:', event.data)
      // 处理接收到的消息
      hasNewMessage.value = true
    }
    
    websocket.value.onclose = () => {
      console.log('WebSocket连接已关闭')
      isConnected.value = false
      // 尝试重连
      setTimeout(connectWebSocket, 5000)
    }
    
    websocket.value.onerror = (error) => {
      console.error('WebSocket连接错误:', error)
      isConnected.value = false
    }
  } catch (error) {
    console.error('WebSocket连接失败:', error)
  }
}

// 处理WebSocket消息
const handleWebSocketMessage = (data) => {
  // 收到消息时显示红点
  hasNewMessage.value = true
  
  // 如果Messages页面注册了消息处理函数，则调用它
  if (window.globalWebSocket && window.globalWebSocket.onMessage) {
    window.globalWebSocket.onMessage(data)
  }
  
  // 根据消息类型进行处理
  switch (data.msgType) {
    case 1:
      // 处理系统消息
      console.log('收到系统消息:', data)
      break
    case 0:
      // 处理用户消息
      console.log('收到用户消息:', data)
      break
    default:
      console.log('收到未知类型消息:', data)
  }
}

// 发送WebSocket消息
const sendWebSocketMessage = (message) => {
  if (websocket.value && isConnected.value) {
    websocket.value.send(JSON.stringify(message))
  } else {
    console.warn('WebSocket未连接，无法发送消息')
  }
}

// 关闭WebSocket连接
const closeWebSocket = () => {
  if (websocket.value) {
    websocket.value.close(1000, '主动关闭连接')
    websocket.value = null
    isConnected.value = false
  }
}

const handleLogout = () => {
  // 退出登录时关闭WebSocket连接
  closeWebSocket()
  localStorage.removeItem('token')
  router.push('/login')
}

const goToMessages = () => {
  // 点击消息按钮时隐藏红点
  hasNewMessage.value = false
  router.push('/messages')
}

// 组件挂载时建立WebSocket连接
onMounted(() => {
  connectWebSocket()
})

// 组件卸载时关闭WebSocket连接
onUnmounted(() => {
  closeWebSocket()
})

// 将WebSocket相关方法暴露给全局使用
window.globalWebSocket = {
  send: sendWebSocketMessage,
  isConnected: () => isConnected.value,
  reconnect: connectWebSocket
}
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
}

.sidebar-container {
  background-color: #52c41a;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  transition: width 0.3s;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #52c41a;
  padding: 0 16px;
  overflow: hidden;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

.logo-image {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  color: #606266;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: #52c41a;
}

.header-right {
  color: #606266;
  display: flex;
  align-items: center;
  gap: 20px;
}

.message-btn {
  color: #606266;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.message-btn:hover {
  background-color: #f5f7fa;
  color: #52c41a;
}

.message-icon-wrapper {
  position: relative;
  display: inline-block;
}

.message-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  border: 1px solid #fff;
}

.message-text {
  font-size: 14px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 60px;
  transition: all 0.3s;
}

.user-dropdown:hover {
  background: rgba(0, 0, 0, 0.025);
}

.el-dropdown-link {
  margin-left: 8px;
  display: flex;
  align-items: center;
  color: #606266;
}

.el-main {
  background-color: #f5f7fa;
  margin-left: 220px;
  padding: 20px;
  transition: margin-left 0.3s;
}

/* 当侧边栏折叠时调整主内容区域 */
:deep(.el-menu--collapse) {
  width: 64px;
}

/* 当侧边栏折叠时调整主内容区域的边距 */
.sidebar-container.is-collapsed + .el-container .el-main {
  margin-left: 64px;
}
</style>