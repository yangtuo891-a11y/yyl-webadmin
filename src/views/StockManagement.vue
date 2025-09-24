<template>
  <div class="stock-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>库存管理</span>
        </div>
      </template>
      <!-- 搜索条件 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品ID">
            <el-input v-model="searchForm.productId" placeholder="请输入商品ID" clearable @clear="handleSearch" />
          </el-form-item>
      
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedItems.length === 0">删除选中</el-button>
            <el-button type="danger" plain @click="handleDeleteAll">删除全部</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="SPU规格ID" width="180" />
        <el-table-column prop="productId" label="商品ID" width="80" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="processImageUrl(scope.row.productPicture)" style="width: 50px; height: 50px" />
              <span class="product-name">{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="spuName" label="规格名称" width="120" />
        <el-table-column prop="spuValue" label="规格值" width="120" />
        <el-table-column prop="spuStock" label="当前库存" width="120" />
        <el-table-column prop="redisStock" label="销售库存" width="120" />
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleStockAdd(scope.row)">增加库存</el-button>
            <el-button size="small" type="warning" @click="handleStockReduce(scope.row)">减少库存</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="page"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 库存操作对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <span>{{ form.productName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ form.spuStock }}</span>
        </el-form-item>
        <el-form-item :label="operationType === 'add' ? '增加数量' : '减少数量'">
          <el-input-number v-model="form.amount" :min="1" :max="operationType === 'reduce' ? form.spuStock : 999999" />
        </el-form-item>
      
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductSpuStockList, updateProductStock, deleteProductSpu } from '@/api/productsApi'
import { processImageUrl } from '@/utils/imageUtils'

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  fetchData()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  page.value = val
  fetchData()
}

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const operationType = ref('add')
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selectedItems = ref([]) // 选中的库存项目列表
const searchForm = ref({
  productId: '',
  productName: ''
})

const form = ref({
  productId: '',
  productName: '',
  spuStock: 0,
  amount: 1,
  remark: ''
})

// 获取上架商品列表数据
const fetchData = async () => {
  try {
    const params = {
      pageSize: pageSize.value,
      page: page.value
    }
    // 只有当productId有值时才添加到参数中
    if (searchForm.value.productId) {
      params.productId = searchForm.value.productId
    }
    const res = await getProductSpuStockList(params)
   
    tableData.value = res.records.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product ? item.product.productName : '商品不存在',
      spuName: item.spuName,
      spuValue: item.spuValue,
      spuStock: item.spuStock,
      redisStock: item.redisStock,
      productPicture: item.product ? item.product.productPicture : ''
    }))
    total.value = res.total
  
  } catch (error) {
    console.error('获取商品列表出错：', error)
  
  }
}

// 处理增加库存
const handleStockAdd = (row) => {
  operationType.value = 'add'
  dialogTitle.value = '增加库存'
  form.value = {
    ...row,
    amount: 1,
    remark: ''
  }
  dialogVisible.value = true
}

// 处理减少库存
const handleStockReduce = (row) => {
  operationType.value = 'reduce'
  dialogTitle.value = '减少库存'
  form.value = {
    ...row,
    amount: 1,
    remark: ''
  }
  dialogVisible.value = true
}

// 确认库存操作
const handleConfirm = async () => {
  try {
    // 计算新的库存总量
    let newStock
    if (operationType.value === 'add') {
      newStock = form.value.spuStock + form.value.amount
    } else {
      newStock = form.value.spuStock - form.value.amount
      if (newStock < 0) {
        ElMessage.error('库存不能小于0')
        return
      }
    }
    
    await updateProductStock(form.value.id, newStock)
    const message = operationType.value === 'add' ? '增加' : '减少'
    ElMessage.success(`库存${message}成功`)
    dialogVisible.value = false
    await fetchData() // 刷新数据
  } catch (error) {
    console.error('库存操作失败：', error)
    ElMessage.error('库存操作失败')
  }
}

onMounted(() => {
  fetchData()
})
// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.value.productId = ''
  searchForm.value.productName = ''
  page.value = 1
  fetchData()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

// 批量删除选中项目
const handleBatchDelete = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的库存项目')
    return
  }
  
  ElMessageBox.confirm(`确认删除选中的 ${selectedItems.value.length} 个库存项目吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const deletePromises = selectedItems.value.map(item => 
        deleteProductSpu(item.id)
      )
      await Promise.all(deletePromises)
      ElMessage.success(`成功删除 ${selectedItems.value.length} 个库存项目`)
      selectedItems.value = []
      fetchData()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

// 删除全部库存项目
const handleDeleteAll = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('当前没有库存项目可删除')
    return
  }
  
  ElMessageBox.confirm(`确认删除当前页面的所有 ${tableData.value.length} 个库存项目吗？此操作不可恢复！`, '删除全部', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  }).then(async () => {
    try {
      const deletePromises = tableData.value.map(item => 
        deleteProductSpu(item.id)
      )
      await Promise.all(deletePromises)
      ElMessage.success(`成功删除 ${tableData.value.length} 个库存项目`)
      selectedItems.value = []
      fetchData()
    } catch (error) {
      ElMessage.error('删除全部库存项目失败')
    }
  })
}
</script>



<style scoped>
.stock-container {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-name {
  font-size: 14px;
}
</style>