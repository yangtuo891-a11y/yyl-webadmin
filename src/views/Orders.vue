<template>
  <div class="orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-button type="primary" icon="Truck" @click="showShippingManagement">发货管理</el-button>
            <el-button type="warning" icon="RefreshLeft" @click="showRefundManagement">退款管理</el-button>
          </div>
        </div>
      </template>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.pendingPayment }}</div>
                <div class="stat-label">待付款</div>
              </div>
              <el-icon class="stat-icon" color="#f56c6c"><CreditCard /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.pendingShipment }}</div>
                <div class="stat-label">待发货</div>
              </div>
              <el-icon class="stat-icon" color="#409eff"><Box /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.pendingReceive }}</div>
                <div class="stat-label">待收货</div>
              </div>
              <el-icon class="stat-icon" color="#67c23a"><Van /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.pendingRefund }}</div>
                <div class="stat-label">退款中</div>
              </div>
              <el-icon class="stat-icon" color="#e6a23c"><RefreshLeft /></el-icon>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="订单号" style="width: 300px;">
            <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="请选择订单状态" clearable style="width: 200px;">
              <el-option label="待付款" value="0" />
              <el-option label="待发货" value="1" />
              <el-option label="待收货" value="2" />
              <el-option label="待评价" value="3" />
              <el-option label="已完成" value="4" />
              <el-option label="退款中" value="5" />
              <el-option label="已退款" value="6" />
              <el-option label="已取消" value="7" />
            </el-select>
          </el-form-item>
          <el-form-item label="下单时间">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedOrders.length > 0">
        <el-alert
          :title="`已选择 ${selectedOrders.length} 个订单`"
          type="info"
          show-icon
          :closable="false"
        >
          <template #default>
            <div class="batch-buttons">
              <el-button 
                size="small" 
                type="primary" 
                @click="batchShip"
                :disabled="!canBatchShip"
              >
                批量发货
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="batchApproveRefund"
                :disabled="!canBatchRefund"
              >
                批量退款
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>

      <el-table 
        :data="tableData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="orderId"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="280" />
        <el-table-column prop="userName" label="用户ID" width="100" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            <span class="amount">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100" />
        <el-table-column prop="createTime" label="下单时间" width="180">
          <template #default="scope">
            {{ dayjs(scope.row.createTime).format('MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="handleDetail(scope.row)" icon="View">详情</el-button>
              
              <!-- 发货按钮 -->
              <el-button
                v-if="scope.row.status === 1"
                size="small"
                type="primary"
                @click="handleShip(scope.row)"
                icon="Truck"
              >发货</el-button>
              
              <!-- 退款审核按钮 -->
              <el-button
                v-if="scope.row.status === 5"
                size="small"
                type="warning"
                @click="handleApproveRefund(scope.row)"
                icon="Warning"
              >退款审核</el-button>
              
              <!-- 查看物流按钮 -->
              <el-button
                v-if="scope.row.status === 2"
                size="small"
                type="info"
                @click="handleViewLogistics(scope.row)"
                icon="Location"
              >查看物流</el-button>
              
              <!-- 更多操作下拉菜单 -->
              <el-dropdown @command="(command) => handleMoreAction(command, scope.row)">
                <el-button size="small" icon="More" circle></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit" :disabled="scope.row.status > 1">编辑订单</el-dropdown-item>
                    <el-dropdown-item command="cancel" :disabled="scope.row.status > 1">取消订单</el-dropdown-item>
                    <el-dropdown-item command="print">打印订单</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="900px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ dayjs(currentOrder.createTime).format('YYYY-MM-DD HH:mm:ss') }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentOrder.user?.username }}</el-descriptions-item>
        <el-descriptions-item label="用户邮箱">{{ currentOrder.user?.email }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)" effect="dark">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payMethod }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="退款理由" :span="2" v-if="currentOrder.refundCause">{{ currentOrder.refundCause }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="currentOrder.items" style="margin-top: 20px">
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="spuName" label="SPU规格">
          <template #default="scope">
            {{ scope.row.spuName }}: {{ scope.row.spuValue }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="下单价">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="subtotal" label="运费">
          <template #default="scope">
            ¥{{ scope.row.shippingPrice }}
          </template>
        </el-table-column>
      </el-table>

      <div class="order-total">
        <span>订单总额：</span>
        <span class="price">¥{{ currentOrder.totalAmount }}</span>
      </div>
    </el-dialog>

    <!-- 发货管理对话框 -->
    <el-dialog v-model="shippingDialogVisible" title="发货管理" width="600px">
      <div class="shipping-content">
        <el-alert title="发货提醒" type="info" show-icon :closable="false">
          <template #default>
            <p>请确认以下订单信息无误后进行发货操作</p>
          </template>
        </el-alert>
        
        <el-form :model="shippingForm" label-width="100px" style="margin-top: 20px;">
          <el-form-item label="物流公司">
            <el-select v-model="shippingForm.logisticsCompany" placeholder="请选择物流公司">
              <el-option label="顺丰速运" value="SF" />
              <el-option label="圆通速递" value="YTO" />
              <el-option label="中通快递" value="ZTO" />
              <el-option label="申通快递" value="STO" />
              <el-option label="韵达速递" value="YD" />
              <el-option label="百世快递" value="BEST" />
              <el-option label="德邦快递" value="DBL" />
            </el-select>
          </el-form-item>
          <el-form-item label="快递单号">
            <el-input v-model="shippingForm.trackingNumber" placeholder="请输入快递单号" />
          </el-form-item>
          <el-form-item label="发货备注">
            <el-input 
              v-model="shippingForm.remark" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入发货备注（可选）" 
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="shippingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShipping">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 退款管理对话框 -->
    <el-dialog v-model="refundDialogVisible" title="退款管理" width="600px">
      <div class="refund-content">
        <el-alert title="退款审核" type="warning" show-icon :closable="false">
          <template #default>
            <p>请仔细审核退款申请，确认无误后进行退款操作</p>
          </template>
        </el-alert>
        
        <el-descriptions :column="1" border style="margin-top: 20px;">
          <el-descriptions-item label="退款金额">¥{{ currentRefundOrder.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="退款理由">{{ currentRefundOrder.refundCause || '用户未填写' }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ dayjs(currentRefundOrder.createTime).format('YYYY-MM-DD HH:mm:ss') }}</el-descriptions-item>
        </el-descriptions>
        
        <el-form :model="refundForm" label-width="100px" style="margin-top: 20px;">
          <el-form-item label="审核结果">
            <el-radio-group v-model="refundForm.result">
              <el-radio label="approve">同意退款</el-radio>
              <el-radio label="reject">拒绝退款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理备注">
            <el-input 
              v-model="refundForm.remark" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入处理备注" 
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="refundDialogVisible = false">关闭</el-button>
        <el-button type="warning" @click="handleCancelRefund">取消退款</el-button>
        <el-button type="primary" @click="confirmRefund">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 物流查看对话框 -->
    <el-dialog v-model="logisticsDialogVisible" title="物流信息" width="600px">
      <div class="logistics-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物流公司">{{ currentLogistics.company }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ currentLogistics.trackingNumber }}</el-descriptions-item>
          <el-descriptions-item label="发货时间" :span="2">{{ currentLogistics.shipTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="logistics-timeline" style="margin-top: 20px;">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in currentLogistics.timeline"
              :key="index"
              :timestamp="item.time"
              :type="index === 0 ? 'primary' : 'info'"
            >
              {{ item.status }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOrders, getOrderDetail, shipOrder, approveRefund, cancelRefund } from '../api/orderApi'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CreditCard, Box, Van, RefreshLeft, View, Check, Location, More } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const searchForm = ref({
  orderNo: '',
  status: '',
  timeRange: []
})

const tableData = ref([])
const total = ref(0)
const detailDialogVisible = ref(false)
const currentOrder = ref({})
const currentPage = ref(1)
const pageSize = ref(10)

// 新增的响应式数据
const selectedOrders = ref([])
const shippingDialogVisible = ref(false)
const refundDialogVisible = ref(false)
const logisticsDialogVisible = ref(false)
const currentRefundOrder = ref({})
const currentLogistics = ref({})

// 统计数据
const stats = ref({
  pendingPayment: 0,
  pendingShipment: 0,
  pendingReceive: 0,
  pendingRefund: 0
})

// 发货表单
const shippingForm = ref({
  logisticsCompany: '',
  trackingNumber: '',
  remark: ''
})

// 退款表单
const refundForm = ref({
  result: 'approve',
  remark: ''
})

// 计算属性
const canBatchShip = computed(() => {
  return selectedOrders.value.every(order => order.status === 1)
})

const canBatchRefund = computed(() => {
  return selectedOrders.value.every(order => order.status === 5)
})

const getStatusType = (status) => {
  const statusMap = {
    0: 'warning',  // 待付款
    1: 'primary',  // 待发货
    2: 'info',     // 待收货
    3: 'warning',  // 待评价
    4: 'success',  // 已完成
    5: 'danger',   // 退款中
    6: 'info',     // 已退款
    7: 'danger'    // 已取消
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '待评价',
    4: '已完成',
    5: '退款中',
    6: '已退款',
    7: '已取消'
  }
  return statusMap[status] || '未知'
}

const getPayTypeText = (payType) => {
  const payTypeMap = {
    0: '支付宝',
    1: '微信'
  }
  return payTypeMap[payType] || '未知'
}

const fetchOrders = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchForm.value.orderNo,
      status: searchForm.value.status,
      startTime: searchForm.value.timeRange?.[0],
      endTime: searchForm.value.timeRange?.[1],
      shippingFilter: searchForm.value.shippingFilter,
      refundFilter: searchForm.value.refundFilter
    }
    const res = await getOrders(params)
    tableData.value = res.records.map(order => ({
      orderId: order.orderId,
      orderNo: order.orderId,
      userName: order.userId,
      totalAmount: order.productPrice + order.shippingPrice,
      status: order.orderState,
      payMethod: getPayTypeText(order.payType),
      createTime: order.createTime,
      receiverAddress: order.address,
      remark: order.orderRemark
    }))
    total.value = res.total
    
    // 更新统计数据
    updateStats(res.records)
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

// 更新统计数据
const updateStats = (orders) => {
  stats.value = {
    pendingPayment: orders.filter(order => order.orderState === 0).length,
    pendingShipment: orders.filter(order => order.orderState === 1).length,
    pendingReceive: orders.filter(order => order.orderState === 2).length,
    pendingRefund: orders.filter(order => order.orderState === 5).length
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

const handleReset = () => {
  searchForm.value = {
    orderNo: '',
    status: '',
    timeRange: []
  }
  currentPage.value = 1
  fetchOrders()
}

const handleDetail = async (row) => {
  try {
    const res = await getOrderDetail(row.orderId)
    currentOrder.value = {
      ...row,
      user: res.user,
      receiverAddress: res.address,
      refundCause: res.refundCause,
      items: [{
        productName: res.product.productName,
        price: res.productPrice,
        spuName: res.spuName,
        spuValue: res.spuValue,
        quantity: res.productNum,
        subtotal: res.productPrice + res.shippingPrice,
        shippingPrice: res.shippingPrice
      }]
    }
    detailDialogVisible.value = true
  } catch (error) {
    console.log(error)
    ElMessage.error('获取订单详情失败')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

const handleApproveRefund = async (row) => {
  try {
    // 获取完整的订单详情，包括退款原因
    const res = await getOrderDetail(row.orderId)
    currentRefundOrder.value = {
      ...row,
      refundCause: res.refundCause,
      totalAmount: res.productPrice + res.shippingPrice,
      createTime: res.createTime
    }
    refundDialogVisible.value = true
  } catch (error) {
    console.log(error)
    ElMessage.error('获取订单详情失败')
  }
}

// 新增的方法
// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 显示发货管理
const showShippingManagement = () => {
  // 清空其他搜索条件，只保留发货相关状态
  searchForm.value = {
    orderNo: '',
    status: '', // 不设置特定状态，通过后端筛选
    timeRange: [],
    shippingFilter: true // 添加发货筛选标识
  }
  handleSearch()
}

// 显示退款管理
const showRefundManagement = () => {
  // 清空其他搜索条件，只保留退款相关状态
  searchForm.value = {
    orderNo: '',
    status: '', // 不设置特定状态，通过后端筛选
    timeRange: [],
    refundFilter: true // 添加退款筛选标识
  }
  handleSearch()
}

// 发货处理
const handleShip = (row) => {
  currentOrder.value = row
  shippingForm.value = {
    logisticsCompany: '',
    trackingNumber: '',
    remark: ''
  }
  shippingDialogVisible.value = true
}

// 确认发货
const confirmShipping = async () => {
  if (!shippingForm.value.logisticsCompany || !shippingForm.value.trackingNumber) {
    ElMessage.warning('请填写物流公司和快递单号')
    return
  }
  
  try {
    await shipOrder(currentOrder.value.orderId)
    ElMessage.success('发货成功')
    shippingDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

// 确认退款
const confirmRefund = async () => {
  try {
    const data = {
      result: refundForm.value.result,
      remark: refundForm.value.remark
    }
    
    await approveRefund(currentRefundOrder.value.orderId, data)
    
    if (refundForm.value.result === 'approve') {
      ElMessage.success('退款审核通过')
    } else {
      ElMessage.success('退款申请已拒绝')
    }
    
    refundDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    ElMessage.error('退款审核失败')
  }
}

// 取消退款
const handleCancelRefund = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消此订单的退款申请吗？取消后订单将恢复到已完成状态。',
      '取消退款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await cancelRefund(currentRefundOrder.value.orderId)
    ElMessage.success('退款申请已取消')
    refundDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消退款失败')
    }
  }
}

// 批量发货
const batchShip = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedOrders.value.length} 个订单进行批量发货吗？`,
      '批量发货确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    for (const order of selectedOrders.value) {
      await shipOrder(order.orderId)
    }
    
    ElMessage.success('批量发货成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量发货失败')
    }
  }
}

// 批量退款
const batchApproveRefund = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedOrders.value.length} 个订单进行批量退款吗？`,
      '批量退款确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    for (const order of selectedOrders.value) {
      await approveRefund(order.orderId, {
        result: 'approve',
        remark: '批量审核通过'
      })
    }
    
    ElMessage.success('批量退款成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量退款失败')
    }
  }
}

// 查看物流
const handleViewLogistics = (row) => {
  // 这里应该调用实际的物流查询API
  currentLogistics.value = {
    company: '',
    trackingNumber: '',
    shipTime: '',
    timeline: []
  }
  logisticsDialogVisible.value = true
}

// 更多操作处理
const handleMoreAction = (command, row) => {
  switch (command) {
    case 'edit':
      ElMessage.info('编辑订单功能开发中')
      break
    case 'cancel':
      handleCancelOrder(row)
      break
    case 'print':
      handlePrintOrder(row)
      break
  }
}

// 取消订单
const handleCancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个订单吗？',
      '取消订单确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    // 用户取消操作
  }
}

// 打印订单
const handlePrintOrder = (row) => {
  ElMessage.info('打印订单功能开发中')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  opacity: 0.3;
}

.search-bar {
  margin-bottom: 20px;
}

.batch-actions {
  margin-bottom: 15px;
}

.batch-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.amount {
  font-weight: bold;
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.order-total {
  margin-top: 20px;
  text-align: right;
  font-size: 16px;
}

.order-total .price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
}

.shipping-content,
.refund-content,
.logistics-content {
  padding: 10px 0;
}

.logistics-timeline {
  max-height: 300px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards .el-col {
    margin-bottom: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 状态标签样式优化 */
:deep(.el-tag) {
  font-weight: 500;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}
</style>