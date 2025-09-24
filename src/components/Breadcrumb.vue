<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
        <span
          v-if="index === breadcrumbs.length - 1"
          class="no-redirect"
        >{{ item.meta.title || item.name }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title || item.name }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref([])

// 获取面包屑数据
const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]

  // 如果不是首页，添加首页到面包屑
  if (first && first.path !== '/') {
    matched = [{ path: '/', meta: { title: '首页' } }].concat(matched)
  }

  breadcrumbs.value = matched
}

// 处理面包屑点击
const handleLink = (item) => {
  router.push(item.path)
}

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 60px;
  margin-left: 8px;
}

.app-breadcrumb .no-redirect {
  color: #97a8be;
  cursor: text;
}

/* 面包屑动画 */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>