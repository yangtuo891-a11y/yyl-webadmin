<template>
  <div class="featured-recommendation-container">
    <ProductSelector
      v-model="showProductSelector"
      :selected-products="selectedProducts"
      @confirm="handleProductSelect"
    />

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>精品推荐</span>
            <el-tag type="info" style="margin-left: 10px;">当前数量: {{ activeCount }}/8</el-tag>
          </div>
          <div>
            <el-button type="success" @click="handleAdd" :disabled="activeCount >= 8">新增推荐</el-button>
          </div>
        </div>
      </template>
      
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
          </el-form-item>
          <el-form-item label="推荐状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="productPicture" label="商品图片" width="120">
          <template #default="scope">
            <el-image
              style="width: 50px; height: 50px"
              :src="processImageUrl(scope.row.productPicture)"
              :preview-src-list="[scope.row.productPicture]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="productPrice" label="商品价格" width="120">
          <template #default="scope">
            ¥{{ scope.row.productPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="recommendReason" label="推荐理由" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              :type="scope.row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="商品" prop="productId">
          <el-button @click="showProductSelector = true">选择商品</el-button>
          <div v-if="form.productName" style="margin-top: 10px;">
            <el-tag>{{ form.productName }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="推荐理由" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入推荐理由"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ProductSelector from '@/components/ProductSelector.vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { processImageUrl } from '@/utils/imageUtils'
import {
  getFeaturedRecommendationList,
  addFeaturedRecommendation,
  updateFeaturedRecommendation,
  deleteFeaturedRecommendation,
  updateFeaturedRecommendationStatus
} from '@/api/featuredRecommendationApi'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const formRef = ref()

const searchForm = ref({
  productName: '',
  status: ''
})

const form = ref({
  id: '',
  productId: '',
  productName: '',
  description: '',
  status: 1
})

const rules = ref({
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  description: [{ required: true, message: '请输入推荐理由', trigger: 'blur' }]
})

const showProductSelector = ref(false)

// 计算当前启用的精品推荐数量
const activeCount = computed(() => {
  return tableData.value.filter(item => item.status === 1).length
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...searchForm.value
    }
    const res = await getFeaturedRecommendationList(params)
    tableData.value = res.content || []
    total.value = res.totalElements || 0
  } catch (error) {
    console.error('获取精品推荐列表失败:', error)
    ElMessage.error('获取精品推荐列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}



const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增精品推荐'
  form.value = {
    id: '',
    productId: '',
    productName: '',
    description: '',
    status: 1
  }
  dialogVisible.value = true
}



const handleEdit = (row) => {
  dialogTitle.value = '编辑精品推荐'
  form.value = {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    description: row.recommendReason || '', // 后端返回的是recommendReason字段
    status: row.status
  }
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await updateFeaturedRecommendationStatus(row.id, newStatus)
    ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
    fetchData()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该精品推荐吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFeaturedRecommendation(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

const handleProductSelect = async (products) => {
  // 单个商品选择
  if (products.length > 0) {
    const product = products[0]
    form.value.productId = product.productId
    form.value.productName = product.productName
  }
  showProductSelector.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // 创建提交数据，移除不需要的字段
    const submitData = {
      productId: form.value.productId,
      description: form.value.description,
      status: form.value.status
    }
    
    // 如果是编辑，添加id字段
    if (form.value.id) {
      submitData.id = form.value.id
      await updateFeaturedRecommendation(form.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await addFeaturedRecommendation(submitData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('保存失败:', error)
      let errorMessage = '保存失败'
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      ElMessage.error(errorMessage)
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.featured-recommendation-container {
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

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style>