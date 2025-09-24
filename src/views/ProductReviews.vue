<template>
  <div class="reviews-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>评价管理</span>
          <el-button type="danger" @click="handleDeleteAll">删除所有评论</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="productId" label="商品ID" width="80" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="processImageUrl(scope.row.productPicture)" style="width: 50px; height: 50px" />
              <span class="product-name">{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="rating" label="评分" width="80" />
        <el-table-column prop="content" label="评价内容" min-width="200" />
        <el-table-column prop="createTime" label="评价时间" width="180">
          <template #default="scope">
            {{ dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除评价</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReviewList, deleteReview, deleteAllReviews } from '../api/reviewApi'
import dayjs from 'dayjs'
import { processImageUrl } from '@/utils/imageUtils'

const tableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取评价列表数据
const fetchData = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getReviewList(params)
    tableData.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取评价列表失败')
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteReview(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const handleDeleteAll = () => {
  ElMessageBox.confirm('确定要删除所有评论吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  })
    .then(async () => {
      try {
        await deleteAllReviews()
        ElMessage.success('所有评论删除成功')
        fetchData()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 初始化加载数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.reviews-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-name {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>