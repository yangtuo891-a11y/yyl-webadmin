import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/Home.vue')
      },
      {
        path: '/dict',
        name: 'dictManagement',
        component: () => import('../views/DictManagement.vue'),
        meta: { title: '字典管理', icon: 'el-icon-notebook-2' },
        children: [
          {
            path: 'spec',
            name: 'specDict',
            component: () => import('../views/SpecDict.vue'),
            meta: { title: '标签字典' }
          },
          {
            path: 'attr',
            name: 'attrDict',
            component: () => import('../views/AttributeDict.vue'),
            meta: { title: '商品属性字典' }
          },

        ]
      },
      {
        path: '/home-manage',
        name: 'homeManage',
        meta: { title: '首页管理', icon: 'el-icon-house' },
        children: [
          {
            path: 'ads',
            name: 'ads',
            component: () => import('../views/Ads.vue'),
            meta: { title: '广告位管理' }
          },

          {
            path: 'brand-recommend',
            name: 'brandRecommend',
            component: () => import('../views/home/BrandRecommend.vue'),
            meta: { title: '品牌推荐管理' }
          }
        ]
      },
      {
        path: '/categories',
        name: 'categories',
        component: () => import('../views/Categories.vue')
      },

      {
        path: '/featured-recommendation',
        name: 'featuredRecommendation',
        component: () => import('../views/FeaturedRecommendation.vue')
      },
      {
        path: '/products',
        name: 'products',
        component: () => import('../views/Products.vue')
      },
      {
        path: '/products/stock',
        name: 'stockManagement',
        component: () => import('../views/StockManagement.vue')
      },
      
      {
        path: '/products/reviews',
        name: 'productReviews',
        component: () => import('../views/ProductReviews.vue')
      },
      {
        path: '/products/edit/:id?',
        name: 'productEdit',
        component: () => import('../views/ProductEdit.vue')
      },
      {
        path: '/orders',
        name: 'orders',
        component: () => import('../views/Orders.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/Users.vue')
      },
      {
        path: '/announcement',
        name: 'announcement',
        component: () => import('../views/Announcement.vue')
      },
      // 运费管理功能已移除
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果访问登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 如果没有token，重定向到登录页面
  if (!token) {
    next('/login')
    return
  }
  
  // 有token，正常访问
  next()
})

export default router