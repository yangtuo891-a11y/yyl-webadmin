<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">仪表盘</h1>
      <div class="dashboard-date">{{ currentDate }}</div>
    </div>

    <!-- 基础统计数据 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-0">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.totalUsers">
                  <template #suffix>
                    <span>人</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-1">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><ShoppingCart /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.totalOrders">
                  <template #suffix>
                    <span>单</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">总订单数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-2">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><ChatDotRound /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.totalComments">
                  <template #suffix>
                    <span>条</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">评论数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-3">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.todaySales">
                  <template #prefix>
                    <span>¥</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-4">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><Van /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.unsendOrders">
                  <template #suffix>
                    <span>单</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">待发货订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="dashboard-card dashboard-card-5">
          <div class="dashboard-card-content">
            <div class="dashboard-card-icon">
              <el-icon :size="24"><RefreshRight /></el-icon>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-value">
                <el-statistic :value="dashboardData.refundOrders">
                  <template #suffix>
                    <span>单</span>
                  </template>
                </el-statistic>
              </div>
              <div class="dashboard-card-label">待退款订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售统计图表 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单统计</span>
              <el-radio-group v-model="orderChartTimeRange" size="small">
                <el-radio-button label="week">近一周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart">
            <div ref="orderChartRef" style="width: 100%; height: 350px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售额统计</span>
              <el-radio-group v-model="salesChartTimeRange" size="small">
                <el-radio-button label="week">近一周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart">
            <div ref="salesChartRef" style="width: 100%; height: 350px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { countUser,countOrder,countComments,countTodayAmmout,countUnsendOrder,countRefundOrder } from '@/api/userApi'
import { getOrderStats, getSalesStats } from '@/api/chartApi'
import { User, ShoppingCart, ChatDotRound, Money, Van, RefreshRight } from '@element-plus/icons-vue'

// 当前日期显示
const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
})

// 仪表盘数据
const dashboardData = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalComments: 0,
  todaySales: 0,
  unsendOrders: 0,
  refundOrders: 0
})

// 图表时间范围选择
const orderChartTimeRange = ref('week')
const salesChartTimeRange = ref('week')

// 订单统计图表配置
const orderChartOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [],
    type: 'line',
    smooth: true
  }]
})

// 销售额统计图表配置
const salesChartOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [],
    type: 'bar'
  }]
})

// 模拟获取数据
// 获取数据
const fetchDashboardData = async () => {
  // 这里可以添加实际的API调用
  const response = await countUser()
  dashboardData.value.totalUsers = response

  const response1 = await countOrder()
  dashboardData.value.totalOrders = response1
  
  const response2 = await countComments()
  dashboardData.value.totalComments = response2


  const response3 = await countTodayAmmout()
  dashboardData.value.todaySales = response3

  const response4 = await countUnsendOrder()
  dashboardData.value.unsendOrders = response4

  const response5 = await countRefundOrder()
  dashboardData.value.refundOrders = response5
}

// echarts实例
let orderChart = null
let salesChart = null

// 初始化图表
const initCharts = () => {
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value)
    orderChart.setOption(orderChartOption.value)
  }
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    salesChart.setOption(salesChartOption.value)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  orderChart?.resize()
  salesChart?.resize()
}

// 图表DOM引用
const orderChartRef = ref(null)
const salesChartRef = ref(null)

onMounted(() => {
  fetchDashboardData()
  initCharts()
  fetchOrderStats('week')
  fetchSalesStats('week')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  orderChart?.dispose()
  salesChart?.dispose()
})

// 获取订单统计数据
const fetchOrderStats = async (timeRange) => {
  try {
    const response = await getOrderStats(timeRange)
    orderChartOption.value.xAxis.data = response.dates
    orderChartOption.value.series[0].data = response.counts
    orderChart?.setOption(orderChartOption.value)
  } catch (error) {
    console.error('获取订单统计数据失败:', error)
  }
}

// 获取销售额统计数据
const fetchSalesStats = async (timeRange) => {
  try {
    const response = await getSalesStats(timeRange)
    salesChartOption.value.xAxis.data = response.dates
    salesChartOption.value.series[0].data = response.counts
    salesChart?.setOption(salesChartOption.value)
  } catch (error) {
    console.error('获取销售额统计数据失败:', error)
  }
}

// 监听时间范围变化
watch([orderChartTimeRange, salesChartTimeRange], ([newOrderRange, newSalesRange], [oldOrderRange, oldSalesRange]) => {
  if (newOrderRange !== oldOrderRange) {
    fetchOrderStats(newOrderRange)
  }
  if (newSalesRange !== oldSalesRange) {
    fetchSalesStats(newSalesRange)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.dashboard-date {
  font-size: 14px;
  color: #666;
}

.data-overview {
  margin-bottom: 24px;
}

.dashboard-card {
  height: 120px;
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.dashboard-card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.dashboard-card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.dashboard-card-0 .dashboard-card-icon {
  background-color: #52c41a;
}

.dashboard-card-1 .dashboard-card-icon {
  background-color: #1890ff;
}

.dashboard-card-2 .dashboard-card-icon {
  background-color: #722ed1;
}

.dashboard-card-3 .dashboard-card-icon {
  background-color: #fa8c16;
}

.dashboard-card-4 .dashboard-card-icon {
  background-color: #13c2c2;
}

.dashboard-card-5 .dashboard-card-icon {
  background-color: #eb2f96;
}

.dashboard-card-info {
  flex: 1;
}

.dashboard-card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1.2;
}

.dashboard-card-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.chart-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.chart {
  padding: 10px;
  height: 300px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard-card {
    height: auto;
    padding: 15px;
  }
  
  .dashboard-card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-card-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}

.el-card {
  margin-bottom: 20px;
}
</style>