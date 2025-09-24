<template>
  <div class="users-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>
      
       
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar
              :size="40"
              :src="scope.row.userIcon"
              v-if="scope.row.userIcon"
            />
            <el-avatar
              :size="40"
              v-else
            >{{ scope.row.username.charAt(0).toUpperCase() }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="250"/>
        <el-table-column prop="phone" label="手机号" width="180" />
      
        <el-table-column prop="address" label="默认收货地址"  />
        <el-table-column prop="disabled" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.disabled == 0 ? 'success' : 'danger'">
              {{ scope.row.disabled == 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
       
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.disabled == 0 ? 'danger' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.disabled ==0? '禁用' : '启用' }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleViewFavorites(scope.row)"
            >
              查看收藏
            </el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentUser.status ? '正常' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ currentUser.lastLoginTime }}</el-descriptions-item>
      </el-descriptions>

      <div class="user-stats">
        <h3>用户统计</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">订单数</div>
              <div class="stat-value">{{ currentUser.orderCount }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">消费金额</div>
              <div class="stat-value">¥{{ currentUser.totalSpent }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-title">收藏数</div>
              <div class="stat-value">{{ currentUser.favoriteCount }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 用户收藏列表对话框 -->
    <el-dialog v-model="favoritesDialogVisible" title="收藏列表" width="800px">
      <el-table :data="favoritesList" style="width: 100%">
        <el-table-column prop="productId" label="商品ID" width="120" />
        <el-table-column prop="product.productName" label="商品名称" />
        <el-table-column prop="createTime" label="收藏时间" width="180">
          <template #default="scope">
            {{ dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="favoritesTotal"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleFavoritesSizeChange"
          @current-change="handleFavoritesCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserList, updateUserStatus, getUserDetail, getUserFavorites } from '@/api/userApi'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const searchForm = ref({
  username: '',
  phone: '',
  timeRange: []
})

const tableData = ref([])
const total = ref(0)
const detailDialogVisible = ref(false)
const currentUser = ref({})
const currentPage = ref(1)
const pageSize = ref(10)

// 收藏列表相关
const favoritesDialogVisible = ref(false)
const favoritesList = ref([])
const favoritesTotal = ref(0)
const favoritesCurrentPage = ref(1)
const favoritesPageSize = ref(10)

// 切换密码显示状态
const togglePasswordVisibility = (row) => {
  row.showPassword = !row.showPassword
}

// 获取用户列表数据
const fetchUserList = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      username: searchForm.value.username,
      phone: searchForm.value.phone
    }
    
    if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
      params.startTime = searchForm.value.timeRange[0]
      params.endTime = searchForm.value.timeRange[1]
    }

    const res = await getUserList(params)
    tableData.value = res.records.map(item => ({
      id: item.userId,
      username: item.username,
      phone: item.phone,
      password: item.password,
      showPassword: false,
      address: item.address,
      disabled: item.disabled,
      userIcon: item.userIcon
    }))
    total.value = res.total
  } catch (error) {
    console.error(error)
    // ElMessage.error('获取用户列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const handleReset = () => {
  searchForm.value = {
    username: '',
    phone: '',
    timeRange: []
  }
  currentPage.value = 1
  fetchUserList()
}

const handleDetail = async (row) => {
  try {
    const res = await getUserDetail(row.id)
    currentUser.value = {
      ...res.data,
      id: res.data.user_id,
      status: !res.data.disabled,
      userIcon: res.data.user_icon
    }
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    let value = 0
    if(row.disabled == 0){
      value = 1
    }else{
      value = 0
    }
    await updateUserStatus(row.id, value)
    ElMessage.success(`${row.disabled==0 ? '禁用' : '启用'}用户成功`)
    fetchUserList()
  } catch (error) {
    ElMessage.error(`${row.disabled==0 ? '禁用' : '启用'}用户失败`)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUserList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchUserList()
}

// 查看用户收藏
const handleViewFavorites = async (row) => {
  favoritesCurrentPage.value = 1
  favoritesDialogVisible.value = true
  await fetchUserFavorites(row.id)
}

// 获取用户收藏列表
const fetchUserFavorites = async (userId) => {
  try {
    const res = await getUserFavorites({
      userId,
      page: favoritesCurrentPage.value,
      size: favoritesPageSize.value
    })
    favoritesList.value = res.records
    favoritesTotal.value = res.total
  } catch (error) {
    ElMessage.error('获取收藏列表失败')
  }
}

// 收藏列表分页
const handleFavoritesSizeChange = (size) => {
  favoritesPageSize.value = size
  favoritesCurrentPage.value = 1
  fetchUserFavorites()
}

const handleFavoritesCurrentChange = (page) => {
  favoritesCurrentPage.value = page
  fetchUserFavorites()
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.user-stats {
  margin-top: 20px;
}

.user-stats h3 {
  margin-bottom: 15px;
  font-weight: normal;
  color: #606266;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.password-field {
  cursor: pointer;
  user-select: none;
  color: #409EFF;
}
</style>